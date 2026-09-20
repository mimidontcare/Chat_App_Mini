import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import {
  HomeScreen,
  MessagesScreen,
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

export type MainTabType = 'home' | 'messages' | 'friends' | 'profile';

type ActiveScreen =
  | { type: 'tabs'; tab: MainTabType }
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

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Auth local state for toggling between Login and Register
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Demo bypass state: allows exploring all screens even before backend is connected
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Active main screen routing (Mặc định vào Tab Home)
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>({
    type: 'tabs',
    tab: 'home',
  });

  const isAuthenticated = !!user || isDemoActive;

  // Cập nhật số lượng thông báo & tin nhắn chưa đọc từ backend
  const fetchBadgeCounts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [notifRes, friendRes, convRes] = await Promise.all([
        api.get('/notifications/unread-count').catch(() => ({ data: { unread_count: 0 } })),
        api.get('/friends/requests').catch(() => ({ data: { requests: [] } })),
        api.get('/conversations').catch(() => ({ data: { conversations: [] } })),
      ]);
      setUnreadNotificationsCount(notifRes.data?.unread_count || 0);
      setFriendRequestsCount(friendRes.data?.requests?.length || 0);

      const convs = convRes.data?.conversations || [];
      const unreadTotal = convs.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0);
      setUnreadMessagesCount(unreadTotal);
    } catch {
      // bỏ qua
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBadgeCounts();

    const socket = getSocket();
    if (socket) {
      const handleBadgeUpdate = () => {
        fetchBadgeCounts();
      };
      socket.on('new_notification', handleBadgeUpdate);
      socket.on('receive_message', handleBadgeUpdate);
      socket.on('conversation_updated', handleBadgeUpdate);
      return () => {
        socket.off('new_notification', handleBadgeUpdate);
        socket.off('receive_message', handleBadgeUpdate);
        socket.off('conversation_updated', handleBadgeUpdate);
      };
    }
  }, [fetchBadgeCounts, currentScreen]);

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
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'messages' })}
      />
    );
  }

  // Search Screen
  if (currentScreen.type === 'search') {
    return (
      <SearchScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
        onStartChat={handleStartChatWithPeer}
      />
    );
  }

  // Friend Requests Screen
  if (currentScreen.type === 'friendRequests') {
    return (
      <FriendRequestsScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
        onStartChat={handleStartChatWithPeer}
      />
    );
  }

  // Message Requests Screen
  if (currentScreen.type === 'messageRequests') {
    return (
      <MessageRequestsScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
        onOpenChat={(conv) => setCurrentScreen({ type: 'chat', conversation: conv })}
      />
    );
  }

  // Notifications Screen
  if (currentScreen.type === 'notifications') {
    return (
      <NotificationsScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
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
        {activeTab === 'home' && (
          <HomeScreen
            onSelectConversation={(conv) =>
              setCurrentScreen({ type: 'chat', conversation: conv })
            }
            onOpenSearch={() => setCurrentScreen({ type: 'search' })}
            onOpenProfile={() => setCurrentScreen({ type: 'tabs', tab: 'profile' })}
            onOpenMessageRequests={() => setCurrentScreen({ type: 'messageRequests' })}
            onOpenFriendRequests={() => setCurrentScreen({ type: 'friendRequests' })}
            onOpenNotifications={() => setCurrentScreen({ type: 'notifications' })}
            onNavigateToMessages={() => setCurrentScreen({ type: 'tabs', tab: 'messages' })}
            onStartChatWithPeer={handleStartChatWithPeer}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesScreen
            onSelectConversation={(conv) =>
              setCurrentScreen({ type: 'chat', conversation: conv })
            }
            onOpenSearch={() => setCurrentScreen({ type: 'search' })}
          />
        )}

        {activeTab === 'friends' && (
          <FriendRequestsScreen
            onStartChat={handleStartChatWithPeer}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            onEditProfile={() => setCurrentScreen({ type: 'editProfile' })}
            onLogoutPress={() => setIsDemoActive(false)}
          />
        )}
      </View>

      {/* 4 Bottom Tabs Bar (Mục 4: Home, Messages, Friends, Profile) */}
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
        {/* Tab 1: Home */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
          style={styles.tabItem}
          hitSlop={8}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'home' }}
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === 'home' && [
                styles.tabIconActivePill,
                { backgroundColor: colors.primaryLight },
              ],
            ]}
          >
            <Ionicons
              name={activeTab === 'home' ? 'home' : 'home-outline'}
              size={22}
              color={activeTab === 'home' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              Typography.caption,
              styles.tabLabel,
              {
                color: activeTab === 'home' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'home' ? '700' : '500',
              },
            ]}
          >
            Trang chủ
          </Text>
        </Pressable>

        {/* Tab 2: Messages */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'messages' })}
          style={styles.tabItem}
          hitSlop={8}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'messages' }}
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === 'messages' && [
                styles.tabIconActivePill,
                { backgroundColor: colors.primaryLight },
              ],
            ]}
          >
            <Ionicons
              name={activeTab === 'messages' ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={22}
              color={activeTab === 'messages' ? colors.primary : colors.textSecondary}
            />
            {unreadMessagesCount > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: colors.unreadBadge }]}>
                <Text style={styles.tabBadgeText}>
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              Typography.caption,
              styles.tabLabel,
              {
                color: activeTab === 'messages' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'messages' ? '700' : '500',
              },
            ]}
          >
            Tin nhắn
          </Text>
        </Pressable>

        {/* Tab 3: Friends */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'friends' })}
          style={styles.tabItem}
          hitSlop={8}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'friends' }}
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === 'friends' && [
                styles.tabIconActivePill,
                { backgroundColor: colors.primaryLight },
              ],
            ]}
          >
            <Ionicons
              name={activeTab === 'friends' ? 'people' : 'people-outline'}
              size={22}
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
              styles.tabLabel,
              {
                color: activeTab === 'friends' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'friends' ? '700' : '500',
              },
            ]}
          >
            Bạn bè
          </Text>
        </Pressable>

        {/* Tab 4: Profile */}
        <Pressable
          onPress={() => setCurrentScreen({ type: 'tabs', tab: 'profile' })}
          style={styles.tabItem}
          hitSlop={8}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'profile' }}
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === 'profile' && [
                styles.tabIconActivePill,
                { backgroundColor: colors.primaryLight },
              ],
            ]}
          >
            <Ionicons
              name={activeTab === 'profile' ? 'person' : 'person-outline'}
              size={22}
              color={activeTab === 'profile' ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              Typography.caption,
              styles.tabLabel,
              {
                color: activeTab === 'profile' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'profile' ? '700' : '500',
              },
            ]}
          >
            Hồ sơ
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
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginBottom: 2,
  },
  tabIconActivePill: {
    borderRadius: Radius.pill,
  },
  tabBadge: {
    position: 'absolute',
    top: 0,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 1,
  },
});
