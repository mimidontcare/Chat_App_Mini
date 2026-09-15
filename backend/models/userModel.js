const db = require('../config/db');

const userModel = {
  // Tìm user theo username
  async findByUsername(username) {
    const [rows] = await db.query(
      'SELECT id, username, email, password_hash, avatar_url, created_at FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  },

  // Tìm user theo email
  async findByEmail(email) {
    if (!email) return null;
    const [rows] = await db.query(
      'SELECT id, username, email, password_hash, avatar_url, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // Tìm user theo ID (không trả password_hash)
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Tạo user mới
  async create({ username, email, password_hash }) {
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email || null, password_hash]
    );
    return result.insertId;
  },

  // Cập nhật thông tin profile
  async updateProfile(id, { username, email, avatar_url }) {
    await db.query(
      'UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [username || null, email || null, avatar_url || null, id]
    );
    return this.findById(id);
  },

  // Tìm kiếm người dùng và kiểm tra trạng thái quan hệ
  async searchUsers(query, currentUserId) {
    const searchPattern = `%${query}%`;
    const [rows] = await db.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.avatar_url,
        u.created_at,
        CASE
          WHEN u.id = ? THEN 'self'
          WHEN EXISTS (
            SELECT 1 FROM friendships 
            WHERE (user1_id = LEAST(?, u.id) AND user2_id = GREATEST(?, u.id))
          ) THEN 'friend'
          WHEN EXISTS (
            SELECT 1 FROM friend_requests 
            WHERE sender_id = ? AND receiver_id = u.id AND status = 'pending'
          ) THEN 'request_sent'
          WHEN EXISTS (
            SELECT 1 FROM friend_requests 
            WHERE sender_id = u.id AND receiver_id = ? AND status = 'pending'
          ) THEN 'request_received'
          ELSE 'none'
        END AS relationship
      FROM users u
      WHERE (u.username LIKE ? OR u.email LIKE ?) AND u.id != ?
      ORDER BY u.username ASC
      LIMIT 30`,
      [
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        searchPattern,
        searchPattern,
        currentUserId,
      ]
    );
    return rows;
  },
};

module.exports = userModel;
