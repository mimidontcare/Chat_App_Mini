import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StatusBar } from 'expo-status-bar';

import '../global.css';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider as AppThemeProvider, useThemeContext } from '@/context/ThemeContext';
import { AppNavigator } from '@/navigation/AppNavigator';
import { Loading } from '@/components/common/Loading';

SplashScreen.preventAutoHideAsync();

function MainContent() {
  const { isLoading } = useAuth();
  const { isDark } = useThemeContext();

  if (isLoading) {
    return <Loading fullScreen message="Đang khởi động..." />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <MainContent />
      </AuthProvider>
    </AppThemeProvider>
  );
}
