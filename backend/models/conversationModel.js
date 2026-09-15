const db = require('../config/db');

const conversationModel = {
  // 1. Tạo hoặc lấy cuộc trò chuyện 1-1 giữa 2 user
  async getOrCreateConversation(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      throw new Error('Không thể tạo cuộc trò chuyện với chính mình!');
    }

    const user1 = Math.min(currentUserId, targetUserId);
    const user2 = Math.max(currentUserId, targetUserId);

    // Kiểm tra xem đã có conversation chưa
    const [existingRows] = await db.query(
      `SELECT c.*, 
              u.id AS peer_id, u.username AS peer_username, u.email AS peer_email, u.avatar_url AS peer_avatar
       FROM conversations c
       JOIN users u ON u.id = ?
       WHERE c.user1_id = ? AND c.user2_id = ?`,
      [targetUserId, user1, user2]
    );

    if (existingRows.length > 0) {
      const conv = existingRows[0];
      return {
        id: conv.id,
        user1_id: conv.user1_id,
        user2_id: conv.user2_id,
        status: conv.status,
        request_sender_id: conv.request_sender_id,
        last_message_id: conv.last_message_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        peer: {
          id: conv.peer_id,
          username: conv.peer_username,
          email: conv.peer_email,
          avatar_url: conv.peer_avatar,
        },
      };
    }

    // Nếu chưa có, kiểm tra xem đã là bạn bè chưa để gán status
    const [friendRows] = await db.query(
      'SELECT id FROM friendships WHERE user1_id = ? AND user2_id = ?',
      [user1, user2]
    );

    const isFriend = friendRows.length > 0;
    const initialStatus = isFriend ? 'normal' : 'message_request';
    const requestSenderId = isFriend ? null : currentUserId;

    const [insertResult] = await db.query(
      'INSERT INTO conversations (user1_id, user2_id, status, request_sender_id) VALUES (?, ?, ?, ?)',
      [user1, user2, initialStatus, requestSenderId]
    );

    // Lấy thông tin đối phương
    const [peerRows] = await db.query('SELECT id, username, email, avatar_url FROM users WHERE id = ?', [
      targetUserId,
    ]);

    return {
      id: insertResult.insertId,
      user1_id: user1,
      user2_id: user2,
      status: initialStatus,
      request_sender_id: requestSenderId,
      last_message_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      peer: peerRows[0],
    };
  },

  // 2. Lấy danh sách đoạn chat bình thường cho HomeScreen
  async getConversationsForUser(userId) {
    const [rows] = await db.query(
      `SELECT 
        c.id,
        c.status,
        c.request_sender_id,
        c.created_at,
        c.updated_at,
        -- Thông tin người đang chat cùng
        u.id AS peer_id,
        u.username AS peer_username,
        u.email AS peer_email,
        u.avatar_url AS peer_avatar,
        -- Tin nhắn cuối cùng
        m.id AS last_message_id,
        m.content AS last_message_content,
        m.message_type AS last_message_type,
        m.sender_id AS last_message_sender_id,
        m.is_read AS last_message_is_read,
        m.created_at AS last_message_created_at,
        -- Đếm số tin nhắn chưa đọc
        (
          SELECT COUNT(1) 
          FROM messages msg 
          WHERE msg.conversation_id = c.id 
            AND msg.sender_id != ? 
            AND msg.is_read = FALSE
        ) AS unread_count
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE (c.user1_id = ? OR c.user2_id = ?)
        AND (
          c.status = 'normal' 
          OR (c.status = 'message_request' AND c.request_sender_id = ?)
        )
      ORDER BY COALESCE(c.updated_at, c.created_at) DESC`,
      [userId, userId, userId, userId, userId]
    );

    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      unread_count: Number(r.unread_count || 0),
      updated_at: r.updated_at,
      peer: {
        id: r.peer_id,
        username: r.peer_username,
        email: r.peer_email,
        avatar_url: r.peer_avatar,
      },
      last_message: r.last_message_id
        ? {
            id: r.last_message_id,
            content: r.last_message_content,
            message_type: r.last_message_type,
            sender_id: r.last_message_sender_id,
            is_read: Boolean(r.last_message_is_read),
            created_at: r.last_message_created_at,
          }
        : null,
    }));
  },

  // 3. Lấy danh sách tin nhắn chờ (Message Requests)
  async getMessageRequestsForUser(userId) {
    const [rows] = await db.query(
      `SELECT 
        c.id,
        c.status,
        c.request_sender_id,
        c.created_at,
        c.updated_at,
        u.id AS peer_id,
        u.username AS peer_username,
        u.email AS peer_email,
        u.avatar_url AS peer_avatar,
        m.id AS last_message_id,
        m.content AS last_message_content,
        m.message_type AS last_message_type,
        m.sender_id AS last_message_sender_id,
        m.created_at AS last_message_created_at
      FROM conversations c
      JOIN users u ON u.id = c.request_sender_id
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE (c.user1_id = ? OR c.user2_id = ?)
        AND c.status = 'message_request'
        AND c.request_sender_id != ?
      ORDER BY COALESCE(c.updated_at, c.created_at) DESC`,
      [userId, userId, userId]
    );

    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      updated_at: r.updated_at,
      peer: {
        id: r.peer_id,
        username: r.peer_username,
        email: r.peer_email,
        avatar_url: r.peer_avatar,
      },
      last_message: r.last_message_id
        ? {
            id: r.last_message_id,
            content: r.last_message_content,
            message_type: r.last_message_type,
            sender_id: r.last_message_sender_id,
            created_at: r.last_message_created_at,
          }
        : null,
    }));
  },

  // 4. Chấp nhận cuộc trò chuyện từ người lạ (Message Request)
  async acceptMessageRequest(conversationId, userId) {
    const [result] = await db.query(
      `UPDATE conversations 
       SET status = 'normal', request_sender_id = NULL 
       WHERE id = ? 
         AND (user1_id = ? OR user2_id = ?) 
         AND request_sender_id != ?`,
      [conversationId, userId, userId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Đoạn chat không tồn tại hoặc bạn không có quyền chấp nhận!');
    }

    return { success: true, message: 'Đã chấp nhận tin nhắn chờ!' };
  },

  // 5. Lấy lịch sử tin nhắn trong cuộc hội thoại
  async getMessages(conversationId, userId, limit = 50, offset = 0) {
    // Xác thực người dùng có thuộc đoạn chat này không
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (conv.length === 0) {
      throw new Error('Bạn không có quyền truy cập vào cuộc hội thoại này!');
    }

    const [rows] = await db.query(
      `SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message_type,
        m.content,
        m.image_url,
        m.is_read,
        m.created_at,
        u.username AS sender_username,
        u.avatar_url AS sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
      LIMIT ? OFFSET ?`,
      [conversationId, Number(limit), Number(offset)]
    );

    return rows;
  },

  // 6. Gửi tin nhắn mới và cập nhật last_message_id
  async sendMessage(conversationId, senderId, { content, message_type = 'text', image_url = null }) {
    // Kiểm tra quyền
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, senderId, senderId]
    );

    if (conv.length === 0) {
      throw new Error('Bạn không có quyền gửi tin nhắn vào cuộc hội thoại này!');
    }

    // 1. Thêm tin nhắn vào bảng messages
    const [msgResult] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, message_type, content, image_url, is_read) VALUES (?, ?, ?, ?, ?, FALSE)',
      [conversationId, senderId, message_type, content || null, image_url || null]
    );

    const messageId = msgResult.insertId;

    // 2. Cập nhật last_message_id và updated_at cho conversations
    await db.query(
      'UPDATE conversations SET last_message_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [messageId, conversationId]
    );

    // 3. Trả về thông tin tin nhắn vừa tạo
    const [newMsg] = await db.query(
      `SELECT m.*, u.username AS sender_username, u.avatar_url AS sender_avatar 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = ?`,
      [messageId]
    );

    return newMsg[0];
  },

  // 7. Đánh dấu đã đọc các tin nhắn trong đoạn chat
  async markAsRead(conversationId, userId) {
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE',
      [conversationId, userId]
    );
    return { success: true };
  },
};

module.exports = conversationModel;
