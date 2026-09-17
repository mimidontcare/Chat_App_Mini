const jwt = require('jsonwebtoken');

let ioInstance = null;

// Quản lý danh sách người dùng đang online: Map<userId, Set<socketId>>
const onlineUsers = new Map();

const socketHandler = (io) => {
  ioInstance = io;
  // Middleware xác thực JWT cho kết nối socket nếu client gửi token trong handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // { id, username }
      } catch (err) {
        console.warn('Socket token không hợp lệ (cho phép kết nối unauthenticated trước setup):', err.message);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Client kết nối Socket: ${socket.id}`);

    // Helper đăng ký user online
    const registerUserOnline = (userId) => {
      socket.userId = userId;
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Tham gia vào phòng riêng của chính mình để nhận thông báo / tin nhắn trực tiếp
      socket.join(`user_${userId}`);

      console.log(`User #${userId} online (Sockets: ${onlineUsers.get(userId).size})`);

      // Thông báo cho mọi người biết user này vừa online
      io.emit('user_online', { userId });
    };

    // Nếu socket đã được xác thực từ handshake -> đăng ký ngay
    if (socket.user?.id) {
      registerUserOnline(socket.user.id);
    }

    // 1. Sự kiện 'setup': Client chủ động gửi thông tin xác thực sau khi connect
    socket.on('setup', (data) => {
      let userId = data?.userId || data?.id;

      // Nếu client gửi kèm token, xác thực lại để đảm bảo an toàn
      if (data?.token) {
        try {
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          userId = decoded.id;
          socket.user = decoded;
        } catch (e) {
          console.error('Setup token invalid:', e.message);
        }
      }

      if (userId) {
        registerUserOnline(userId);
        socket.emit('connected', { success: true, userId });
        // Gửi danh sách user online cho client
        socket.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });

    // Client yêu cầu danh sách user online
    socket.on('get_online_users', () => {
      socket.emit('online_users_list', Array.from(onlineUsers.keys()));
    });

    // Client kiểm tra 1 user cụ thể có online không
    socket.on('check_user_online', ({ userId }, callback) => {
      const isOnline = onlineUsers.has(Number(userId)) && onlineUsers.get(Number(userId)).size > 0;
      if (typeof callback === 'function') {
        callback({ userId, isOnline });
      } else {
        socket.emit('user_online_status', { userId, isOnline });
      }
    });

    // 2. Sự kiện 'join_chat': Tham gia vào phòng của một cuộc trò chuyện
    socket.on('join_chat', (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} (User #${socket.userId}) tham gia phòng ${room}`);
    });

    // 3. Sự kiện 'leave_chat': Rời khỏi phòng trò chuyện
    socket.on('leave_chat', (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} rời phòng ${room}`);
    });

    // 4. Sự kiện 'send_message': Phát tin nhắn realtime
    socket.on('send_message', (data) => {
      const { conversation_id, receiver_id, message } = data;
      if (!conversation_id || !message) return;

      console.log(`Phát tin nhắn realtime trong conv_${conversation_id}:`, message.content || '[Image]');

      // Gửi cho tất cả những người đang mở phòng chat này (trừ chính người gửi)
      socket.to(`conv_${conversation_id}`).emit('receive_message', message);

      // Đồng thời gửi tới phòng cá nhân của người nhận (nếu họ đang ở ngoài HomeScreen)
      if (receiver_id) {
        socket.to(`user_${receiver_id}`).emit('receive_message', message);
        socket.to(`user_${receiver_id}`).emit('conversation_updated', message);
      }
    });

    // 5. Sự kiện 'typing' & 'stop_typing' (Typing Indicator)
    socket.on('typing', ({ conversation_id, receiver_id, username }) => {
      if (conversation_id) {
        socket.to(`conv_${conversation_id}`).emit('display_typing', {
          conversation_id,
          username: username || socket.user?.username,
        });
      } else if (receiver_id) {
        socket.to(`user_${receiver_id}`).emit('display_typing', {
          conversation_id,
          username: username || socket.user?.username,
        });
      }
    });

    socket.on('stop_typing', ({ conversation_id, receiver_id }) => {
      if (conversation_id) {
        socket.to(`conv_${conversation_id}`).emit('hide_typing', { conversation_id });
      } else if (receiver_id) {
        socket.to(`user_${receiver_id}`).emit('hide_typing', { conversation_id });
      }
    });

    // 6. Sự kiện 'message_read': Thông báo tin nhắn đã được xem
    socket.on('message_read', ({ conversation_id, reader_id, sender_id }) => {
      if (sender_id) {
        socket.to(`user_${sender_id}`).emit('messages_marked_read', {
          conversation_id,
          reader_id,
        });
      }
      if (conversation_id) {
        socket.to(`conv_${conversation_id}`).emit('messages_marked_read', {
          conversation_id,
          reader_id,
        });
      }
    });

    // 7. Sự kiện 'send_reaction': Thao tác thả/gỡ biểu cảm cảm xúc tin nhắn realtime
    socket.on('send_reaction', ({ conversation_id, receiver_id, message_id, reaction, user_id }) => {
      if (!conversation_id || !message_id) return;

      const reactionData = {
        conversation_id,
        message_id,
        reaction,
        user_id: user_id || socket.userId,
      };

      socket.to(`conv_${conversation_id}`).emit('receive_reaction', reactionData);

      if (receiver_id) {
        socket.to(`user_${receiver_id}`).emit('receive_reaction', reactionData);
      }
    });

    // 7. Ngắt kết nối và dọn dẹp
    socket.on('disconnect', () => {
      console.log(`Client ngắt kết nối Socket: ${socket.id}`);
      const userId = socket.userId;

      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);

        // Nếu không còn socket nào của user này -> Đánh dấu offline hoàn toàn
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          console.log(`User #${userId} đã offline hoàn toàn`);
          io.emit('user_offline', { userId });
        }
      }
    });
  });
};

const emitNotificationToUser = (userId, notification) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
  }
};

module.exports = socketHandler;
module.exports.emitNotificationToUser = emitNotificationToUser;

