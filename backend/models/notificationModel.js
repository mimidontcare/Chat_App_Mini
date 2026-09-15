const db = require('../config/db');

const notificationModel = {
  // 1. Tạo thông báo mới
  async createNotification(userId, type, content) {
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, type, content, is_read) VALUES (?, ?, ?, FALSE)',
      [userId, type, content]
    );

    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  // 2. Lấy danh sách thông báo của một người dùng
  async getNotificationsForUser(userId, limit = 50, offset = 0) {
    const [rows] = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), Number(offset)]
    );

    return rows.map((r) => ({
      ...r,
      is_read: Boolean(r.is_read),
    }));
  },

  // 3. Đánh dấu một thông báo là đã đọc
  async markAsRead(notificationId, userId) {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return { success: true };
  },

  // 4. Đánh dấu tất cả thông báo là đã đọc
  async markAllAsRead(userId) {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return { success: true };
  },

  // 5. Đếm số lượng thông báo chưa đọc
  async getUnreadCount(userId) {
    const [rows] = await db.query(
      'SELECT COUNT(1) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return Number(rows[0]?.count || 0);
  },
};

module.exports = notificationModel;
