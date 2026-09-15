const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Cập nhật thông tin cá nhân (JWT bắt buộc)
router.put('/profile', authMiddleware, userController.updateProfile);

// Upload ảnh đại diện (JWT bắt buộc)
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// Lấy thông tin user theo ID (JWT bắt buộc)
router.get('/:id', authMiddleware, userController.getProfile);

module.exports = router;
