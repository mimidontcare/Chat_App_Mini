const db = require('../config/db');

const friendModel = {
  // Gửi lời mời kết bạn
  async sendRequest(senderId, receiverId) {
    if (senderId === receiverId) {
      throw new Error('Bạn không thể gửi lời mời kết bạn cho chính mình!');
    }

    // 1. Kiểm tra người nhận có tồn tại không
    const [receiverRows] = await db.query('SELECT id, username FROM users WHERE id = ?', [receiverId]);
    if (receiverRows.length === 0) {
      throw new Error('Người dùng không tồn tại!');
    }

    // 2. Kiểm tra xem đã là bạn bè chưa (theo quy tắc user1_id < user2_id)
    const user1 = Math.min(senderId, receiverId);
    const user2 = Math.max(senderId, receiverId);
    const [friendRows] = await db.query(
      'SELECT id FROM friendships WHERE user1_id = ? AND user2_id = ?',
      [user1, user2]
    );
    if (friendRows.length > 0) {
      throw new Error('Hai bạn đã là bạn bè rồi!');
    }

    // 3. Kiểm tra xem đã có lời mời 2 chiều đang pending chưa
    const [existingRequests] = await db.query(
      'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      [senderId, receiverId, receiverId, senderId]
    );

    if (existingRequests.length > 0) {
      const existing = existingRequests[0];
      if (existing.status === 'pending') {
        if (existing.sender_id === senderId) {
          throw new Error('Bạn đã gửi lời mời kết bạn rồi, vui lòng chờ đối phương phản hồi!');
        } else {
          // Đối phương đã gửi lời mời cho mình trước đó -> Tự động chấp nhận luôn!
          return this.acceptRequest(existing.id, senderId);
        }
      } else {
        // Nếu đã từng bị rejected, cho phép gửi lại
        await db.query(
          'UPDATE friend_requests SET sender_id = ?, receiver_id = ?, status = "pending", created_at = CURRENT_TIMESTAMP WHERE id = ?',
          [senderId, receiverId, existing.id]
        );
        return { id: existing.id, status: 'pending' };
      }
    }

    // 4. Tạo mới lời mời kết bạn
    const [result] = await db.query(
      'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, "pending")',
      [senderId, receiverId]
    );

    // 5. Thêm thông báo vào bảng notifications
    try {
      const [senderInfo] = await db.query('SELECT username FROM users WHERE id = ?', [senderId]);
      await db.query(
        'INSERT INTO notifications (user_id, type, content) VALUES (?, "friend_request", ?)',
        [receiverId, `${senderInfo[0]?.username || 'Ai đó'} đã gửi cho bạn lời mời kết bạn.`]
      );
    } catch (notifErr) {
      console.warn('Lỗi ghi notification (bỏ qua):', notifErr.message);
    }

    return { id: result.insertId, status: 'pending' };
  },

  // Lấy danh sách lời mời kết bạn gửi đến mình
  async getPendingRequests(userId) {
    const [rows] = await db.query(
      `SELECT 
        fr.id,
        fr.created_at,
        fr.status,
        u.id AS sender_id,
        u.username AS sender_username,
        u.email AS sender_email,
        u.avatar_url AS sender_avatar
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC`,
      [userId]
    );

    return rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      status: r.status,
      sender: {
        id: r.sender_id,
        username: r.sender_username,
        email: r.sender_email,
        avatar_url: r.sender_avatar,
      },
    }));
  },

  // Chấp nhận lời mời kết bạn
  async acceptRequest(requestId, userId) {
    // 1. Tìm lời mời
    const [rows] = await db.query(
      'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE id = ? AND receiver_id = ?',
      [requestId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Lời mời kết bạn không tồn tại hoặc bạn không có quyền xử lý!');
    }

    const request = rows[0];
    if (request.status === 'accepted') {
      throw new Error('Lời mời này đã được chấp nhận trước đó!');
    }

    const senderId = request.sender_id;
    const user1 = Math.min(senderId, userId);
    const user2 = Math.max(senderId, userId);

    // 2. Cập nhật trạng thái request
    await db.query('UPDATE friend_requests SET status = "accepted" WHERE id = ?', [requestId]);

    // 3. Thêm vào bảng friendships (chống trùng lặp bằng IGNORE hoặc check)
    await db.query(
      'INSERT IGNORE INTO friendships (user1_id, user2_id) VALUES (?, ?)',
      [user1, user2]
    );

    // 4. Thông báo cho người gửi ban đầu
    try {
      const [receiverInfo] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
      await db.query(
        'INSERT INTO notifications (user_id, type, content) VALUES (?, "friend_accepted", ?)',
        [senderId, `${receiverInfo[0]?.username || 'Bạn bè'} đã chấp nhận lời mời kết bạn của bạn.`]
      );
    } catch (notifErr) {
      console.warn('Lỗi ghi notification (bỏ qua):', notifErr.message);
    }

    return { success: true, message: 'Đã chấp nhận kết bạn thành công!', sender_id: senderId };
  },

  // Từ chối lời mời kết bạn
  async rejectRequest(requestId, userId) {
    const [result] = await db.query(
      'UPDATE friend_requests SET status = "rejected" WHERE id = ? AND receiver_id = ?',
      [requestId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Lời mời không tồn tại hoặc không thể từ chối!');
    }

    return { success: true, message: 'Đã từ chối lời mời kết bạn!' };
  },

  // Lấy danh sách bạn bè hiện tại
  async getFriends(userId) {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        f.created_at AS friend_since
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user1_id = ? THEN f.user2_id 
          ELSE f.user1_id 
        END = u.id
      )
      WHERE f.user1_id = ? OR f.user2_id = ?
      ORDER BY u.username ASC`,
      [userId, userId, userId]
    );

    return rows;
  },
};

module.exports = friendModel;
