const friendModel = require('../models/friendModel');

const friendController = {
  // Gửi lời mời kết bạn
  async sendRequest(req, res) {
    try {
      const senderId = req.user.id;
      const { receiver_id } = req.body;

      if (!receiver_id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp ID người nhận (receiver_id)!',
        });
      }

      const result = await friendModel.sendRequest(senderId, Number(receiver_id));

      return res.status(201).json({
        success: true,
        message: 'Gửi lời mời kết bạn thành công!',
        data: result,
      });
    } catch (error) {
      console.error('Lỗi API sendRequest:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi máy chủ khi gửi lời mời kết bạn!',
      });
    }
  },

  // Lấy danh sách lời mời kết bạn gửi đến mình
  async getRequests(req, res) {
    try {
      const userId = req.user.id;
      const requests = await friendModel.getPendingRequests(userId);

      return res.status(200).json({
        success: true,
        requests,
      });
    } catch (error) {
      console.error('Lỗi API getRequests:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách lời mời kết bạn!',
      });
    }
  },

  // Chấp nhận lời mời kết bạn
  async acceptRequest(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await friendModel.acceptRequest(Number(id), userId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Lỗi API acceptRequest:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi chấp nhận kết bạn!',
      });
    }
  },

  // Từ chối lời mời kết bạn
  async rejectRequest(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await friendModel.rejectRequest(Number(id), userId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Lỗi API rejectRequest:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Lỗi khi từ chối kết bạn!',
      });
    }
  },

  // Lấy danh sách bạn bè
  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      const friends = await friendModel.getFriends(userId);

      return res.status(200).json({
        success: true,
        friends,
      });
    } catch (error) {
      console.error('Lỗi API getFriends:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách bạn bè!',
      });
    }
  },
};

module.exports = friendController;
