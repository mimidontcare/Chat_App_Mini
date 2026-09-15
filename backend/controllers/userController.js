const userModel = require('../models/userModel');

const userController = {
  // Lấy thông tin user theo ID
  async getProfile(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng!',
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error('Lỗi API getProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy thông tin người dùng!',
      });
    }
  },

  // Cập nhật thông tin profile
  async updateProfile(req, res) {
    try {
      const currentUserId = req.user.id;
      const { username, email, avatar_url } = req.body;

      // Kiểm tra nếu đổi username có bị trùng với người khác không
      if (username && username.trim()) {
        const existing = await userModel.findByUsername(username.trim());
        if (existing && existing.id !== currentUserId) {
          return res.status(409).json({
            success: false,
            message: 'Tên đăng nhập này đã được sử dụng bởi người khác!',
          });
        }
      }

      // Kiểm tra nếu đổi email có bị trùng với người khác không
      if (email && email.trim()) {
        const existingEmail = await userModel.findByEmail(email.trim());
        if (existingEmail && existingEmail.id !== currentUserId) {
          return res.status(409).json({
            success: false,
            message: 'Email này đã được sử dụng bởi người khác!',
          });
        }
      }

      const updatedUser = await userModel.updateProfile(currentUserId, {
        username: username ? username.trim() : null,
        email: email !== undefined ? (email ? email.trim() : null) : null,
        avatar_url: avatar_url || null,
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công!',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Lỗi API updateProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi cập nhật thông tin!',
      });
    }
  },

  // Upload avatar
  async uploadAvatar(req, res) {
    try {
      const currentUserId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file ảnh để tải lên!',
        });
      }

      // Tạo đường dẫn ảnh tĩnh phục vụ từ server
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Cập nhật vào MySQL
      const updatedUser = await userModel.updateProfile(currentUserId, {
        avatar_url: avatarUrl,
      });

      return res.status(200).json({
        success: true,
        message: 'Tải lên ảnh đại diện thành công!',
        avatar_url: avatarUrl,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Lỗi API uploadAvatar:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tải lên ảnh đại diện!',
      });
    }
  },

  // Tìm kiếm người dùng theo từ khóa
  async searchUsers(req, res) {
    try {
      const currentUserId = req.user.id;
      const query = (req.query.q || '').trim();

      if (!query) {
        return res.status(200).json({
          success: true,
          users: [],
        });
      }

      const users = await userModel.searchUsers(query, currentUserId);

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error('Lỗi API searchUsers:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi tìm kiếm người dùng!',
      });
    }
  },
};

module.exports = userController;
