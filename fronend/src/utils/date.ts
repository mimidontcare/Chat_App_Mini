/**
 * Định dạng thời gian theo phong cách mạng xã hội / nhắn tin thân thiện
 * @param dateStr Chuỗi thời gian ISO từ database
 * @returns Chuỗi thời gian đã định dạng
 */
export const formatMessageTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

/**
 * Định dạng thời gian cho danh sách cuộc hội thoại (hôm nay: giờ:phút, ngày trước: ngày/tháng)
 */
export const formatConversationTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    if (diffHours < 48 && d.getDate() === now.getDate() - 1) {
      return 'Hôm qua';
    }

    return d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
  } catch {
    return '';
  }
};

/**
 * Định dạng thời gian tương đối (Vừa xong, x phút trước, x giờ trước, x ngày trước)
 */
export const formatRelativeTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
};
