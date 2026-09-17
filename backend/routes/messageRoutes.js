const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

const { uploadChatImage } = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

// Gửi tin nhắn mới
router.post('/', chatController.sendMessage);

// Gửi tin nhắn ảnh
router.post('/image', uploadChatImage.single('image'), chatController.sendImageMessage);

// Đánh dấu tin nhắn trong conversation đã đọc
router.put('/conversation/:id/read', chatController.markAsRead);

// Cập nhật reaction biểu cảm cho tin nhắn
router.post('/:messageId/reaction', chatController.updateReaction);
router.put('/:messageId/reaction', chatController.updateReaction);

module.exports = router;
