import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { useColorScheme } from 'react-native';

import '../global.css';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppNavigator } from '@/navigation/AppNavigator';
import { Loading } from '@/components/common/Loading';

SplashScreen.preventAutoHideAsync();

function MainContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Loading Messenger..." />;
  }

  return <AppNavigator />;
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
