import React from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { WebActiveTab } from './types';

interface WebSidebarProps {
  user: any;
  activeTab: WebActiveTab;
  onTabChange: (tab: WebActiveTab) => void;
  unreadMessagesCount: number;
  friendRequestsCount: number;
  unreadNotificationsCount: number;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const WebSidebar: React.FC<WebSidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  unreadMessagesCount,
  friendRequestsCount,
  unreadNotificationsCount,
  onOpenProfile,
  onLogout,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: isDark ? '#0B1120' : '#FFFFFF',
          borderRightColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(226, 232, 240, 0.9)',
        },
      ]}
    >
      {/* Top: Current User Avatar with Profile trigger */}
      <View style={styles.topSection}>
        <Pressable
          onPress={onOpenProfile}
          style={({ hovered }: any) => [
            styles.avatarBtn,
            hovered && styles.avatarBtnHovered,
          ]}
          accessibilityLabel="Xem hồ sơ cá nhân"
          accessibilityRole="button"
        >
          <Avatar
            uri={user?.avatar_url}
            name={user?.username || 'User'}
            size={42}
            isOnline={true}
          />
        </Pressable>
      </View>

      {/* Center: Main Navigation Tabs */}
      <View style={styles.navSection}>
        {/* 1. Chats Tab */}
        <Pressable
          onPress={() => onTabChange('chats')}
          style={({ hovered }: any) => [
            styles.navItem,
            activeTab === 'chats' && [
              styles.navItemActive,
              { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)' },
            ],
            hovered && activeTab !== 'chats' && [
              styles.navItemHovered,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.8)' },
            ],
          ]}
          accessibilityLabel="Tin nhắn"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'chats' }}
        >
          {activeTab === 'chats' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeTab === 'chats' ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
            size={23}
            color={activeTab === 'chats' ? colors.primary : colors.textSecondary}
          />
          {unreadMessagesCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </Text>
            </View>
          )}
        </Pressable>

        {/* 2. Friends / Contacts Tab */}
        <Pressable
          onPress={() => onTabChange('friends')}
          style={({ hovered }: any) => [
            styles.navItem,
            activeTab === 'friends' && [
              styles.navItemActive,
              { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)' },
            ],
            hovered && activeTab !== 'friends' && [
              styles.navItemHovered,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.8)' },
            ],
          ]}
          accessibilityLabel="Bạn bè & Danh bạ"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'friends' }}
        >
          {activeTab === 'friends' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeTab === 'friends' ? 'people' : 'people-outline'}
            size={23}
            color={activeTab === 'friends' ? colors.primary : colors.textSecondary}
          />
          {friendRequestsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {friendRequestsCount > 99 ? '99+' : friendRequestsCount}
              </Text>
            </View>
          )}
        </Pressable>

        {/* 3. Notifications Tab */}
        <Pressable
          onPress={() => onTabChange('notifications')}
          style={({ hovered }: any) => [
            styles.navItem,
            activeTab === 'notifications' && [
              styles.navItemActive,
              { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)' },
            ],
            hovered && activeTab !== 'notifications' && [
              styles.navItemHovered,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.8)' },
            ],
          ]}
          accessibilityLabel="Thông báo"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'notifications' }}
        >
          {activeTab === 'notifications' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
            size={23}
            color={activeTab === 'notifications' ? colors.primary : colors.textSecondary}
          />
          {unreadNotificationsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </Pressable>

        {/* 4. Search Tab */}
        <Pressable
          onPress={() => onTabChange('search')}
          style={({ hovered }: any) => [
            styles.navItem,
            activeTab === 'search' && [
              styles.navItemActive,
              { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)' },
            ],
            hovered && activeTab !== 'search' && [
              styles.navItemHovered,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.8)' },
            ],
          ]}
          accessibilityLabel="Tìm kiếm"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'search' }}
        >
          {activeTab === 'search' && <View style={styles.activeIndicator} />}
          <Ionicons
            name={activeTab === 'search' ? 'search' : 'search-outline'}
            size={23}
            color={activeTab === 'search' ? colors.primary : colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Bottom: Utilities (Theme, Profile, Logout) */}
      <View style={styles.bottomSection}>
        {/* Theme Toggle Button */}
        <Pressable
          onPress={toggleTheme}
          style={({ hovered }: any) => [
            styles.utilBtn,
            hovered && [
              styles.navItemHovered,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)' },
            ],
          ]}
          accessibilityLabel={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={21}
            color={isDark ? '#FBBF24' : colors.textSecondary}
          />
        </Pressable>

        {/* Profile / Settings Button */}
        <Pressable
          onPress={onOpenProfile}
          style={({ hovered }: any) => [
            styles.utilBtn,
            hovered && [
              styles.navItemHovered,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)' },
            ],
          ]}
          accessibilityLabel="Hồ sơ tài khoản"
        >
          <Ionicons
            name="person-circle-outline"
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* Logout Button */}
        <Pressable
          onPress={onLogout}
          style={({ hovered }: any) => [
            styles.utilBtn,
            hovered && [
              styles.navItemHovered,
              { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' },
            ],
          ]}
          accessibilityLabel="Đăng xuất"
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color={colors.destructive}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 68,
    height: '100%',
    borderRightWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    zIndex: 20,
    ...(Platform.OS === 'web' ? ({ userSelect: 'none' } as any) : {}),
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBtn: {
    padding: 3,
    borderRadius: 9999,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  avatarBtnHovered: {
    transform: [{ scale: 1.05 }],
  },
  navSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  navItem: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.18s ease-in-out',
        } as any)
      : {}),
  },
  navItemActive: {
    transform: [{ scale: 1.02 }],
  },
  navItemHovered: {
    transform: [{ scale: 1.02 }],
  },
  activeIndicator: {
    position: 'absolute',
    left: -10,
    width: 3.5,
    height: 22,
    borderRadius: 9999,
    backgroundColor: '#2563EB',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0B1120',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
  },
  utilBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.18s ease-in-out',
        } as any)
      : {}),
  },
});
