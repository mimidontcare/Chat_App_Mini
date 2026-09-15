const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Gửi tin nhắn mới
router.post('/', chatController.sendMessage);

// Đánh dấu tin nhắn trong conversation đã đọc
router.put('/conversation/:id/read', chatController.markAsRead);

module.exports = router;
