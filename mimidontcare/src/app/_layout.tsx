import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useState } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';

SplashScreen.preventAutoHideAsync();

function MainContent() {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Nếu chưa đăng nhập, hiển thị màn hình Auth (Login / Register)
  if (!user) {
    if (authMode === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthMode('login')} />;
    }
    return <LoginScreen onNavigateToRegister={() => setAuthMode('register')} />;
  }

  // Đã đăng nhập -> hiển thị màn hình chính
  return <AppTabs />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
