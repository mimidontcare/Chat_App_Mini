import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomTabBarProps {
  activeTab: 'chats' | 'profile';
  onTabChange: (tab: 'chats' | 'profile') => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'chats' && styles.activeTabItem]}
        onPress={() => onTabChange('chats')}
        activeOpacity={0.7}
      >
        <Text style={styles.tabIcon}>{activeTab === 'chats' ? '💬' : '🗨️'}</Text>
        <Text style={[styles.tabLabel, activeTab === 'chats' && styles.activeTabLabel]}>
          Đoạn chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'profile' && styles.activeTabItem]}
        onPress={() => onTabChange('profile')}
        activeOpacity={0.7}
      >
        <Text style={styles.tabIcon}>{activeTab === 'profile' ? '👤' : '👤'}</Text>
        <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
          Cá nhân
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  activeTabItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#60a5fa',
    fontWeight: '700',
  },
});
