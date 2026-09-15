const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tất cả các route liên quan đến bạn bè đều yêu cầu đăng nhập (JWT)
router.use(authMiddleware);

// Gửi lời mời kết bạn
router.post('/request', friendController.sendRequest);

// Xem danh sách lời mời kết bạn nhận được
router.get('/requests', friendController.getRequests);

// Chấp nhận lời mời kết bạn
router.post('/request/:id/accept', friendController.acceptRequest);

// Từ chối lời mời kết bạn
router.post('/request/:id/reject', friendController.rejectRequest);

// Xem danh sách bạn bè hiện tại
router.get('/', friendController.getFriends);

module.exports = router;
