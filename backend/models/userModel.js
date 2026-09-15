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
};

module.exports = userModel;
