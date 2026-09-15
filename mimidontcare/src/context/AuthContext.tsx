import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export interface User {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Kiểm tra token đã lưu khi ứng dụng khởi động
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@auth_token');
        const storedUser = await AsyncStorage.getItem('@auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Kiểm tra tính hợp lệ của token với Backend
          try {
            const res = await api.get('/auth/me');
            if (res.data?.success && res.data?.user) {
              setUser(res.data.user);
              await AsyncStorage.setItem('@auth_user', JSON.stringify(res.data.user));
            }
          } catch (verifyError) {
            console.log('Token hết hạn hoặc server chưa sẵn sàng, xóa session:', verifyError);
            await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Lỗi khi đọc token từ AsyncStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Hàm Đăng nhập
  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);

      await AsyncStorage.setItem('@auth_token', receivedToken);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(receivedUser));
    }
  };

  // Hàm Đăng ký
  const register = async (username: string, email: string, password: string) => {
    const res = await api.post('/auth/register', {
      username,
      email: email ? email.trim() : null,
      password,
    });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);

      await AsyncStorage.setItem('@auth_token', receivedToken);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(receivedUser));
    }
  };

  // Cập nhật thông tin User
  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(updatedUser));
  };

  // Hàm Đăng xuất
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
