import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeColors } from '../constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = '@app_theme_mode';

export interface ThemeContextType {
  themeMode: ThemeMode;
  currentTheme: ActiveTheme;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Tải tùy chọn theme từ AsyncStorage khi khởi động
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
          setThemeModeState(storedMode);
        }
      } catch (err) {
        console.warn('Lỗi khi đọc theme từ AsyncStorage:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadStoredTheme();
  }, []);

  // 2. Cập nhật và lưu tùy chọn theme vào AsyncStorage
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Lỗi khi lưu theme vào AsyncStorage:', err);
    }
  }, []);

  // 3. Tính toán theme thực tế (ActiveTheme: 'light' | 'dark')
  const currentTheme: ActiveTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = currentTheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // 4. Chuyển đổi qua lại giữa Light và Dark
  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    await setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      currentTheme,
      isDark,
      colors,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, currentTheme, isDark, colors, setThemeMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback nếu component được gọi bên ngoài Provider
    const isDarkFallback = false;
    return {
      themeMode: 'system',
      currentTheme: 'light',
      isDark: isDarkFallback,
      colors: isDarkFallback ? Colors.dark : Colors.light,
      setThemeMode: async () => {},
      toggleTheme: async () => {},
    };
  }
  return context;
};
