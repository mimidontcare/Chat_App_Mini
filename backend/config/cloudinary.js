const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload một file ảnh lên Cloudinary
 * @param {string} filePath - Đường dẫn cục bộ của file ảnh
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary (vd: 'chat_app/chat', 'chat_app/avatars')
 * @returns {Promise<{ url: string, public_id?: string, isCloudinary: boolean }>}
 */
const uploadToCloudinary = async (filePath, folder = 'chat_app/chat') => {
  // Kiểm tra nếu có cấu hình Cloudinary đầy đủ
  const hasCloudinaryConfig =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (hasCloudinaryConfig) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
      });

      // Xóa file local sau khi upload thành công lên Cloudinary để giải phóng dung lượng
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        url: result.secure_url,
        public_id: result.public_id,
        isCloudinary: true,
      };
    } catch (error) {
      console.warn('Lỗi upload Cloudinary, chuyển sang fallback lưu trữ local:', error.message);
    }
  }

  // Fallback: giữ file local và trả về URL tương đối
  return {
    url: null,
    isCloudinary: false,
  };
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
