const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Lấy danh sách thông báo
router.get('/', notificationController.getNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// Đánh dấu tất cả thông báo là đã đọc
router.put('/read-all', notificationController.markAllAsRead);

// Đánh dấu 1 thông báo là đã đọc
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
