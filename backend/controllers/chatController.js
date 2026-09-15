const conversationModel = require('../models/conversationModel');
const notificationModel = require('../models/notificationModel');
const { uploadToCloudinary } = require('../config/cloudinary');
const { emitNotificationToUser } = require('../sockets/socketHandler');

const chatController = {
  // Lấy danh sách đoạn chat chính (Home)
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await conversationModel.getConversationsForUser(userId);

      return res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      console.error('Lỗi API getConversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách đoạn chat!',
      });
    }
  },

  // Khởi tạo hoặc lấy đoạn chat 1-1 với 1 user
  async initConversation(req, res) {
    try {
      const currentUserId = req.user.id;
      const { peer_id } = req.body;

      if (!peer_id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp peer_id (ID người cần chat)!',
        });
      }

      const conversation = await conversationModel.getOrCreateConversation(
        currentUserId,
        Number(peer_id)
      );

      // Nếu đây là tin nhắn chờ từ người lạ, tạo thông báo cho người nhận
      if (conversation.status === 'message_request' && conversation.request_sender_id === currentUserId) {
        try {
          const notif = await notificationModel.createNotification(
            Number(peer_id),
            'message_request',
            `${req.user.username} đã gửi cho bạn tin nhắn chờ.`
          );
          emitNotificationToUser(Number(peer_id), notif);
        } catch (notifErr) {
          console.warn('Lỗi tạo notification message_request (bỏ qua):', notifErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error('Lỗi API initConversation:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi khởi tạo cuộc trò chuyện!',
      });
    }
  },

  // Lấy danh sách tin nhắn chờ từ người lạ
  async getMessageRequests(req, res) {
    try {
      const userId = req.user.id;
      const requests = await conversationModel.getMessageRequestsForUser(userId);

      return res.status(200).json({
        success: true,
        requests,
      });
    } catch (error) {
      console.error('Lỗi API getMessageRequests:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy tin nhắn chờ!',
      });
    }
  },

  // Chấp nhận tin nhắn chờ
  async acceptMessageRequest(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await conversationModel.acceptMessageRequest(Number(id), userId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Lỗi API acceptMessageRequest:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi chấp nhận tin nhắn chờ!',
      });
    }
  },

  // Từ chối / Xóa tin nhắn chờ từ người lạ
  async rejectMessageRequest(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await conversationModel.rejectMessageRequest(Number(id), userId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Lỗi API rejectMessageRequest:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi từ chối tin nhắn chờ!',
      });
    }
  },

  // Lấy lịch sử tin nhắn của một đoạn chat
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await conversationModel.getMessages(
        Number(id),
        userId,
        limit,
        offset
      );

      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error('Lỗi API getMessages:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi tải lịch sử tin nhắn!',
      });
    }
  },

  // Gửi tin nhắn mới (REST API fallback và persist database)
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { conversation_id, content, message_type = 'text', image_url = null } = req.body;

      if (!conversation_id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp conversation_id!',
        });
      }

      if (!content && !image_url) {
        return res.status(400).json({
          success: false,
          message: 'Nội dung tin nhắn hoặc URL ảnh không được để trống!',
        });
      }

      const newMessage = await conversationModel.sendMessage(
        Number(conversation_id),
        senderId,
        { content, message_type, image_url }
      );

      return res.status(201).json({
        success: true,
        message: 'Gửi tin nhắn thành công!',
        data: newMessage,
      });
    } catch (error) {
      console.error('Lỗi API sendMessage:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi gửi tin nhắn!',
      });
    }
  },

  // Gửi tin nhắn ảnh (upload file)
  async sendImageMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { conversation_id } = req.body;

      if (!conversation_id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp conversation_id!',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file ảnh để gửi!',
        });
      }

      // 1. Thử upload lên Cloudinary (nếu có cấu hình trong .env)
      let imageUrl = `/uploads/chat/${req.file.filename}`;
      try {
        const cloudUpload = await uploadToCloudinary(req.file.path, 'chat_app/chat');
        if (cloudUpload.url) {
          imageUrl = cloudUpload.url;
        }
      } catch (err) {
        console.warn('Lỗi upload Cloudinary, dùng file local:', err.message);
      }

      const newMessage = await conversationModel.sendMessage(
        Number(conversation_id),
        senderId,
        { content: '', message_type: 'image', image_url: imageUrl }
      );

      return res.status(201).json({
        success: true,
        message: 'Gửi ảnh thành công!',
        data: newMessage,
      });
    } catch (error) {
      console.error('Lỗi API sendImageMessage:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi gửi tin nhắn ảnh!',
      });
    }
  },

  // Đánh dấu đã đọc tin nhắn
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params; // conversation_id

      await conversationModel.markAsRead(Number(id), userId);

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu đã đọc!',
      });
    } catch (error) {
      console.error('Lỗi API markAsRead:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi đánh dấu đã đọc!',
      });
    }
  },
};

module.exports = chatController;
