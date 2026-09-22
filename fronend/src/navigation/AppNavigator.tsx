import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows, MaxContentWidth } from '../constants/theme';
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

/**
 * Shell bọc giao diện: Trên Web Desktop tự động căn giữa khung nhìn sang trọng
 * với background ambient glow, trên Mobile giữ nguyên Full Screen tự nhiên.
 */
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors, isDark } = useTheme();

  if (Platform.OS !== 'web') {
    return <View style={[styles.container, { backgroundColor: colors.background }]}>{children}</View>;
  }

  return (
    <View
      style={[
        styles.webOuterWrapper,
        {
          backgroundColor: isDark ? '#080C14' : '#F1F5F9',
        },
        ({
          backgroundImage: isDark
            ? 'radial-gradient(circle at 50% 0%, #152138 0%, #080C14 70%)'
            : 'radial-gradient(circle at 50% 0%, #E0E7FF 0%, #F1F5F9 70%)',
          minHeight: '100vh',
          width: '100%',
        } as any),
      ]}
    >
      <View
        style={[
          styles.webInnerFrame,
          {
            backgroundColor: colors.background,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
          },
          Shadows.floating,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
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
      socket.on('messages_marked_read', handleBadgeUpdate);
      return () => {
        socket.off('new_notification', handleBadgeUpdate);
        socket.off('receive_message', handleBadgeUpdate);
        socket.off('messages_marked_read', handleBadgeUpdate);
      };
    }
  }, [fetchBadgeCounts, currentScreen]);

  // Render Auth flow if not logged in
  if (!isAuthenticated) {
    return (
      <AppShell>
        {authMode === 'register' ? (
          <RegisterScreen onNavigateToLogin={() => setAuthMode('login')} />
        ) : (
          <LoginScreen
            onNavigateToRegister={() => setAuthMode('register')}
            onDemoLogin={() => setIsDemoActive(true)}
          />
        )}
      </AppShell>
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
      <AppShell>
        <ChatScreen
          conversation={currentScreen.conversation}
          onBack={() => setCurrentScreen({ type: 'tabs', tab: 'messages' })}
        />
      </AppShell>
    );
  }

  // Search Screen
  if (currentScreen.type === 'search') {
    return (
      <AppShell>
        <SearchScreen
          onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
          onStartChat={handleStartChatWithPeer}
        />
      </AppShell>
    );
  }

  // Friend Requests Screen
  if (currentScreen.type === 'friendRequests') {
    return (
      <AppShell>
        <FriendRequestsScreen
          onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
          onStartChat={handleStartChatWithPeer}
        />
      </AppShell>
    );
  }

  // Message Requests Screen
  if (currentScreen.type === 'messageRequests') {
    return (
      <AppShell>
        <MessageRequestsScreen
          onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
          onOpenChat={(conv) => setCurrentScreen({ type: 'chat', conversation: conv })}
        />
      </AppShell>
    );
  }

  // Notifications Screen
  if (currentScreen.type === 'notifications') {
    return (
      <AppShell>
        <NotificationsScreen
          onBack={() => setCurrentScreen({ type: 'tabs', tab: 'home' })}
          onOpenFriendRequests={() => setCurrentScreen({ type: 'friendRequests' })}
          onOpenMessageRequests={() => setCurrentScreen({ type: 'messageRequests' })}
          onOpenFriends={() => setCurrentScreen({ type: 'tabs', tab: 'friends' })}
        />
      </AppShell>
    );
  }

  // Edit Profile Screen
  if (currentScreen.type === 'editProfile') {
    return (
      <AppShell>
        <EditProfileScreen
          onBack={() => setCurrentScreen({ type: 'tabs', tab: 'profile' })}
        />
      </AppShell>
    );
  }

  // Bottom Tab Screens
  const activeTab = currentScreen.tab;

  return (
    <AppShell>
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

        {/* Floating Glass Dock Bottom Tabs Bar */}
        <View
          style={[
            styles.bottomTabBar,
            {
              backgroundColor: isDark ? colors.surface : colors.floatingDock,
              borderColor: colors.borderLight,
              paddingBottom: Math.max(Spacing.sm, insets.bottom),
            },
            Shadows.floating,
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
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webOuterWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  webInnerFrame: {
    width: '100%',
    maxWidth: MaxContentWidth,
    height: '96vh' as any,
    maxHeight: 940,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  screenArea: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    transitionDuration: '200ms',
  } as any,
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    marginBottom: 2,
    transitionDuration: '150ms',
  } as any,
  tabIconActivePill: {
    borderRadius: Radius.pill,
    transform: [{ scale: 1.05 }],
  },
  tabBadge: {
    position: 'absolute',
    top: 1,
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
    letterSpacing: -0.1,
  },
});
