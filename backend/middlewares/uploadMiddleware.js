const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục lưu trữ ảnh tồn tại
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
const chatDir = path.join(__dirname, '..', 'uploads', 'chat');

[avatarsDir, chatDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Kiểm tra định dạng file ảnh (JPEG, PNG, WEBP, GIF, JPG)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các định dạng file ảnh hợp lệ: JPEG, PNG, WEBP, GIF!'), false);
  }
};

// Storage cho Avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user?.id || 'user'}-${uniqueSuffix}${ext}`);
  },
});

// Storage cho Chat Image
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, chatDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `chat-${req.user?.id || 'msg'}-${uniqueSuffix}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter,
});

const uploadChatImage = multer({
  storage: chatStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB cho ảnh chat
  fileFilter,
});

// Export linh hoạt để tương thích với tất cả các route
module.exports = uploadAvatar;
module.exports.uploadAvatar = uploadAvatar;
module.exports.uploadChatImage = uploadChatImage;
