const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Tạo token helper
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const authController = {
  // 1. Đăng ký tài khoản
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validate dữ liệu đầu vào
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
        });
      }

      if (username.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập phải có ít nhất 3 ký tự!',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên!',
        });
      }

      // Kiểm tra username đã tồn tại chưa
      const existingUser = await userModel.findByUsername(username.trim());
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Tên đăng nhập này đã được sử dụng!',
        });
      }

      // Kiểm tra email nếu có truyền lên
      if (email && email.trim()) {
        const existingEmail = await userModel.findByEmail(email.trim());
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email này đã được sử dụng!',
          });
        }
      }

      // Hash mật khẩu với bcryptjs
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Lưu vào database
      const newUserId = await userModel.create({
        username: username.trim(),
        email: email ? email.trim() : null,
        password_hash,
      });

      // Lấy thông tin user vừa tạo
      const newUser = await userModel.findById(newUserId);

      // Tạo JWT token
      const token = generateToken({
        id: newUser.id,
        username: newUser.username,
      });

      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        token,
        user: newUser,
      });
    } catch (error) {
      console.error('Lỗi API register:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi đăng ký tài khoản!',
      });
    }
  },

  // 2. Đăng nhập
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tên đăng nhập và mật khẩu!',
        });
      }

      // Cho phép đăng nhập bằng username hoặc email
      let user = await userModel.findByUsername(username.trim());
      if (!user && username.includes('@')) {
        user = await userModel.findByEmail(username.trim());
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
        });
      }

      // Kiểm tra password với bcrypt
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
        });
      }

      // Tạo JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
      });

      // Loại bỏ password_hash trước khi trả về client
      const { password_hash, ...userProfile } = user;

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        user: userProfile,
      });
    } catch (error) {
      console.error('Lỗi API login:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi đăng nhập!',
      });
    }
  },

  // 3. Lấy thông tin user hiện tại (Token Required)
  async getMe(req, res) {
    try {
      const user = await userModel.findById(req.user.id);
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
      console.error('Lỗi API getMe:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy thông tin người dùng!',
      });
    }
  },

  // 4. Đăng xuất
  async logout(req, res) {
    // Với stateless JWT, client chỉ cần xóa token khỏi AsyncStorage
    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công!',
    });
  },
};

module.exports = authController;
