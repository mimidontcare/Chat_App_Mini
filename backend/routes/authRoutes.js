const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Endpoint đăng ký
router.post('/register', authController.register);

// Endpoint đăng nhập
router.post('/login', authController.login);

// Endpoint đăng xuất
router.post('/logout', authController.logout);

// Endpoint lấy thông tin tài khoản hiện tại (Yêu cầu JWT)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
