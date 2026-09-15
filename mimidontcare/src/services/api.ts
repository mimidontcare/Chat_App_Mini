import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Địa chỉ IP máy tính trong mạng Wi-Fi (dùng cho điện thoại thật chạy Expo Go)
const LOCAL_IP = '10.78.29.177';

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

// Trích xuất thông báo lỗi rõ ràng từ response của Backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message || error.message || 'Lỗi kết nối máy chủ!';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
