import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import {
  HomeScreen,
  ProfileScreen,
  SearchScreen,
  ChatScreen,
  FriendRequestsScreen,
  MessageRequestsScreen,
  EditProfileScreen,
  NotificationsScreen,
  LoginScreen,
  RegisterScreen,
} from '../screens';
import api from '../services/api';
import { getSocket } from '../services/socket';

type ActiveScreen =
  | { type: 'tabs'; tab: 'chats' | 'friends' | 'notifications' | 'profile' }
  | { type: 'chat'; conversation: any }
  | { type: 'search' }
  | { type: 'friendRequests' }
  | { type: 'messageRequests' }
  | { type: 'notifications' }
  | { type: 'editProfile' };

export const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Auth local state for toggling between Login and Register
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Demo bypass state: allows exploring all screens even before backend is connected
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Active main screen routing
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>({
    type: 'tabs',
    tab: 'chats',
  });

  const isAuthenticated = !!user || isDemoActive;

  // Cập nhật số lượng thông báo & lời mời kết bạn từ backend
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchBadgeCounts = async () => {
      try {
        const [notifRes, friendRes] = await Promise.all([
          api.get('/notifications/unread-count').catch(() => ({ data: { unread_count: 0 } })),
          api.get('/friends/requests').catch(() => ({ data: { requests: [] } })),
        ]);
        setUnreadNotificationsCount(notifRes.data?.unread_count || 0);
        setFriendRequestsCount(friendRes.data?.requests?.length || 0);
      } catch {
        // bỏ qua
      }
    };

    fetchBadgeCounts();

    const socket = getSocket();
    if (socket) {
      const handleNewNotification = () => {
        fetchBadgeCounts();
      };
      socket.on('new_notification', handleNewNotification);
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [isAuthenticated, currentScreen]);

  // Render Auth flow if not logged in
  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthMode('login')} />;
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthMode('register')}
        onDemoLogin={() => setIsDemoActive(true)}
      />
    );
  }

  const handleStartChatWithPeer = async (peer: any) => {
    try {
      const res = await api.post('/conversations/init', { peer_id: peer.id });
      if (res.data?.success && res.data?.conversation) {
        setCurrentScreen({ type: 'chat', conversation: res.data.conversation });
        return;
      }
    } catch (err) {
      console.error('Lỗi khởi tạo cuộc trò chuyện:', err);
    }

    const fallbackConv = {
      id: Date.now(),
      peer,
      last_message: null,
      unread_count: 0,
    };
    setCurrentScreen({ type: 'chat', conversation: fallbackConv as any });
  };

  // Active Chat Screen
  if (currentScreen.type === 'chat') {
    return (
      <ChatScreen
        conversation={currentScreen.conversation}
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
      />
    );
  }

  // Search Screen
  if (currentScreen.type === 'search') {
    return (
      <SearchScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
        onStartChat={handleStartChatWithPeer}
      />
    );
  }

  // Friend Requests Screen
  if (currentScreen.type === 'friendRequests') {
    return (
      <FriendRequestsScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
        onStartChat={handleStartChatWithPeer}
      />
    );
  }

  // Message Requests Screen
  if (currentScreen.type === 'messageRequests') {
    return (
      <MessageRequestsScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
        onOpenChat={(conv) => setCurrentScreen({ type: 'chat', conversation: conv })}
      />
    );
  }

  // Notifications Screen
  if (currentScreen.type === 'notifications') {
    return (
      <NotificationsScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
        onOpenFriendRequests={() => setCurrentScreen({ type: 'friendRequests' })}
        onOpenMessageRequests={() => setCurrentScreen({ type: 'messageRequests' })}
        onOpenFriends={() => setCurrentScreen({ type: 'tabs', tab: 'friends' })}
      />
    );
  }

  // Edit Profile Screen
  if (currentScreen.type === 'editProfile') {
    return (
      <EditProfileScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'profile' })}
      />
    );
  }

  // Bottom Tab Screens
  const activeTab = currentScreen.tab;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Screen Body */}
      <View style={styles.screenArea}>
        {activeTab === 'chats' && (
          <HomeScreen
            onSelectConversation={(conv) =>
              setCurrentScreen({ type: 'chat', conversation: conv })
            }
            onOpenSearch={() => setCurrentScreen({ type: 'search' })}
            onOpenMessageRequests={() => setCurrentScreen({ type: 'messageRequests' })}
            onOpenFriendRequests={() => setCurrentScreen({ type: 'friendRequests' })}
            onOpenNotifications={() => setCurrentScreen({ type: 'notifications' })}
          />
        )}

        {activeTab === 'friends' && (
          <FriendRequestsScreen
            onStartChat={handleStartChatWithPeer}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsScreen
            onOpenFriendRequests={() => setCurrentScreen({ type: 'friendRequests' })}
            onOpenMessageRequests={() => setCurrentScreen({ type: 'messageRequests' })}
            onOpenFriends={() => setCurrentScreen({ type: 'tabs', tab: 'friends' })}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            onEditProfile={() => setCurrentScreen({ type: 'editProfile' })}
            onLogoutPress={() => setIsDemoActive(false)}
          />
        )}
      </View>

      {/* Modern Bottom Tabs Bar */}
      <View
        style={[
          styles.bottomTabBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            paddingBottom: Math.max(Spacing.sm, insets.bottom),
          },
          Shadows.md,
        ]}
      >
        {/* Chats Tab */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
          style={styles.tabItem}
          hitSlop={6}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'chats' }}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'chats' ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={activeTab === 'chats' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              Typography.caption,
              {
                color: activeTab === 'chats' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'chats' ? '600' : '400',
              },
            ]}
          >
            Đoạn chat
          </Text>
        </Pressable>

        {/* Friends / Requests Tab */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'friends' })}
          style={styles.tabItem}
          hitSlop={6}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'friends' }}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'friends' ? 'people' : 'people-outline'}
              size={24}
              color={activeTab === 'friends' ? colors.primary : colors.textSecondary}
            />
            {friendRequestsCount > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.tabBadgeText}>{friendRequestsCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              Typography.caption,
              {
                color: activeTab === 'friends' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'friends' ? '600' : '400',
              },
            ]}
          >
            Bạn bè
          </Text>
        </Pressable>

        {/* Notifications Tab */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'notifications' })}
          style={styles.tabItem}
          hitSlop={6}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'notifications' }}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
              size={24}
              color={activeTab === 'notifications' ? colors.primary : colors.textSecondary}
            />
            {unreadNotificationsCount > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: colors.unreadBadge }]}>
                <Text style={styles.tabBadgeText}>{unreadNotificationsCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              Typography.caption,
              {
                color: activeTab === 'notifications' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'notifications' ? '600' : '400',
              },
            ]}
          >
            Thông báo
          </Text>
        </Pressable>

        {/* Profile Tab */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'profile' })}
          style={styles.tabItem}
          hitSlop={6}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'profile' }}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'profile' ? 'person' : 'person-outline'}
              size={24}
              color={activeTab === 'profile' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              Typography.caption,
              {
                color: activeTab === 'profile' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'profile' ? '600' : '400',
              },
            ]}
          >
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenArea: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  tabIconWrapper: {
    position: 'relative',
    marginBottom: 3,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
