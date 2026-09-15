const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// 1. Quản lý Conversations
router.get('/', chatController.getConversations);
router.get('/requests', chatController.getMessageRequests);
router.post('/init', chatController.initConversation);
router.post('/request/:id/accept', chatController.acceptMessageRequest);
router.get('/:id/messages', chatController.getMessages);
router.put('/:id/read', chatController.markAsRead);

module.exports = router;
