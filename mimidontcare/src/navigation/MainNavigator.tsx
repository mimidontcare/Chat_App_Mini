import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { BottomTabBar } from '../components/BottomTabBar';

export const MainNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'profile'>('chats');
  const [currentSubScreen, setCurrentSubScreen] = useState<'edit_profile' | null>(null);

  // Khi đang ở màn hình phụ (ví dụ Edit Profile)
  if (currentSubScreen === 'edit_profile') {
    return <EditProfileScreen onBack={() => setCurrentSubScreen(null)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {activeTab === 'chats' ? (
          <HomeScreen onOpenProfile={() => setActiveTab('profile')} />
        ) : (
          <ProfileScreen onNavigateToEditProfile={() => setCurrentSubScreen('edit_profile')} />
        )}
      </View>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  screenContainer: {
    flex: 1,
  },
});
