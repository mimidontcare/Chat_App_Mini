import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Tự động lấy IP máy tính từ Expo Metro bundler khi chạy Expo Go, tránh lỗi khi đổi mạng/phát 4G hotspot
const getDevServerIp = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return '10.96.225.177'; // IP mạng máy tính khi kết nối Điểm phát sóng di động (Hotspot)
};

const LOCAL_IP = getDevServerIp();

export const BASE_URL = Platform.select({
  web: 'http://localhost:5000/api',
  android: `http://${LOCAL_IP}:5000/api`, // Hoặc 'http://10.0.2.2:5000/api' nếu dùng máy ảo Android Studio
  ios: `http://${LOCAL_IP}:5000/api`,     // Hoặc 'http://localhost:5000/api' nếu dùng máy ảo iOS Simulator
  default: `http://${LOCAL_IP}:5000/api`,
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn token vào mọi request nếu đã đăng nhập
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Lỗi lấy token từ AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Trích xuất thông báo lỗi rõ ràng và xử lý lỗi mạng / JWT hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Xử lý timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(new Error('Yêu cầu đã quá thời gian phản hồi (Network timeout). Vui lòng thử lại!'));
    }

    // 2. Xử lý mất mạng / server không phản hồi
    if (!error.response) {
      return Promise.reject(new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!'));
    }

    const { status, data } = error.response;

    // 3. Xử lý token hết hạn (401)
    if (status === 401) {
      if (data?.code === 'TOKEN_EXPIRED') {
        try {
          await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
        } catch {
          // bỏ qua
        }
        return Promise.reject(new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'));
      }
      return Promise.reject(new Error(data?.message || 'Phiên làm việc không hợp lệ, vui lòng đăng nhập lại!'));
    }

    // 4. Xử lý 403 Forbidden
    if (status === 403) {
      return Promise.reject(new Error(data?.message || 'Bạn không có quyền truy cập chức năng này!'));
    }

    // 5. Xử lý 404 Not Found
    if (status === 404) {
      return Promise.reject(new Error(data?.message || 'Không tìm thấy dữ liệu yêu cầu!'));
    }

    // 6. Xử lý 500 Internal Server Error
    if (status >= 500) {
      return Promise.reject(new Error(data?.message || 'Máy chủ gặp sự cố nội bộ. Vui lòng thử lại sau!'));
    }

    const customMessage = data?.message || error.message || 'Đã xảy ra lỗi không xác định!';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
