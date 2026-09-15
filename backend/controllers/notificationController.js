const notificationModel = require('../models/notificationModel');

const notificationController = {
  // Lấy danh sách thông báo của user
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;

      const notifications = await notificationModel.getNotificationsForUser(
        userId,
        Number(limit),
        Number(offset)
      );

      const unreadCount = await notificationModel.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        notifications,
        unread_count: unreadCount,
      });
    } catch (error) {
      console.error('Lỗi API getNotifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải danh sách thông báo!',
      });
    }
  },

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await notificationModel.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        unread_count: count,
      });
    } catch (error) {
      console.error('Lỗi API getUnreadCount:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy số lượng thông báo chưa đọc!',
      });
    }
  },

  // Đánh dấu 1 thông báo là đã đọc
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await notificationModel.markAsRead(Number(id), userId);

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu thông báo là đã đọc!',
      });
    } catch (error) {
      console.error('Lỗi API markAsRead:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật thông báo!',
      });
    }
  },

  // Đánh dấu tất cả thông báo là đã đọc
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      await notificationModel.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu tất cả thông báo là đã đọc!',
      });
    } catch (error) {
      console.error('Lỗi API markAllAsRead:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật tất cả thông báo!',
      });
    }
  },
};

module.exports = notificationController;
