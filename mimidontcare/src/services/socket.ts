import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';

// Địa chỉ Socket Server (cùng host & port với backend API)
export const SOCKET_URL = BASE_URL.replace('/api', '');

let socket: Socket | null = null;

// Khởi tạo và kết nối Socket
export const initSocket = (token?: string | null, userId?: number): Socket => {
  if (socket && socket.connected) {
    if (userId) {
      socket.emit('setup', { token, userId });
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    auth: {
      token: token || undefined,
    },
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected:', socket?.id);
    if (userId) {
      socket?.emit('setup', { token, userId });
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`[Socket.IO] Reconnected sau ${attemptNumber} lần thử:`, socket?.id);
    if (userId) {
      socket?.emit('setup', { token, userId });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('[Socket.IO] Connection error:', error.message);
  });

  socket.on('reconnect_error', (error) => {
    console.warn('[Socket.IO] Reconnect attempt error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.warn('[Socket.IO] Reconnection failed hoàn toàn');
  });

  return socket;
};

// Lấy instance socket hiện tại
export const getSocket = (): Socket | null => {
  return socket;
};

// Ngắt kết nối socket khi đăng xuất
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper: Tham gia phòng chat
export const joinChatRoom = (conversationId: number) => {
  if (socket?.connected) {
    socket.emit('join_chat', conversationId);
  }
};

// Helper: Rời phòng chat
export const leaveChatRoom = (conversationId: number) => {
  if (socket?.connected) {
    socket.emit('leave_chat', conversationId);
  }
};

// Helper: Bắn sự kiện gửi tin nhắn realtime
export const emitSocketMessage = (
  conversationId: number,
  receiverId: number,
  message: any
) => {
  if (socket?.connected) {
    socket.emit('send_message', {
      conversation_id: conversationId,
      receiver_id: receiverId,
      message,
    });
  }
};

// Helper: Bắn sự kiện đang gõ chữ
export const emitTyping = (
  conversationId: number,
  receiverId?: number,
  username?: string
) => {
  if (socket?.connected) {
    socket.emit('typing', {
      conversation_id: conversationId,
      receiver_id: receiverId,
      username,
    });
  }
};

// Helper: Bắn sự kiện dừng gõ chữ
export const emitStopTyping = (conversationId: number, receiverId?: number) => {
  if (socket?.connected) {
    socket.emit('stop_typing', {
      conversation_id: conversationId,
      receiver_id: receiverId,
    });
  }
};

// Helper: Bắn sự kiện đã đọc tin nhắn
export const emitMessageRead = (
  conversationId: number,
  readerId: number,
  senderId?: number
) => {
  if (socket?.connected) {
    socket.emit('message_read', {
      conversation_id: conversationId,
      reader_id: readerId,
      sender_id: senderId,
    });
  }
};

// Helper: Lấy danh sách user online
export const requestOnlineUsers = () => {
  if (socket?.connected) {
    socket.emit('get_online_users');
  }
};
