import React, { useState } from 'react';
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
  LoginScreen,
  RegisterScreen,
} from '../screens';
import {
  MOCK_CONVERSATIONS,
  MOCK_FRIEND_REQUESTS,
  MockConversation,
  MockUser,
} from '../constants/mockData';

type ActiveScreen =
  | { type: 'tabs'; tab: 'chats' | 'friends' | 'profile' }
  | { type: 'chat'; conversation: MockConversation }
  | { type: 'search' }
  | { type: 'friendRequests' }
  | { type: 'messageRequests' }
  | { type: 'editProfile' };

export const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
        onStartChat={(peer: MockUser) => {
          const conv: MockConversation = {
            id: Date.now(),
            peer,
            last_message: {
              content: 'Say hello!',
              message_type: 'text',
              sender_id: peer.id,
              created_at: 'Just now',
              is_read: true,
            },
            unread_count: 0,
          };
          setCurrentScreen({ type: 'chat', conversation: conv });
        }}
      />
    );
  }

  // Friend Requests Screen
  if (currentScreen.type === 'friendRequests') {
    return (
      <FriendRequestsScreen
        onBack={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
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
  const unreadTotal = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unread_count, 0);
  const friendRequestsCount = MOCK_FRIEND_REQUESTS.length;

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
          />
        )}

        {activeTab === 'friends' && (
          <FriendRequestsScreen
            onBack={() => setCurrentScreen({ type: 'tabs', tab: 'chats' })}
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
            {unreadTotal > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: colors.unreadBadge }]}>
                <Text style={styles.tabBadgeText}>{unreadTotal}</Text>
              </View>
            )}
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
            Chats
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
            Friends
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
