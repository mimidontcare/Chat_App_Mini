import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import {
  Avatar,
  SearchBar,
  ConversationItem,
  Loading,
  Badge,
} from '../components/common';
import api from '../services/api';
import { getSocket } from '../services/socket';

export interface HomeScreenProps {
  onSelectConversation?: (conv: any) => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenMessageRequests?: () => void;
  onOpenFriendRequests?: () => void;
  onOpenNotifications?: () => void;
  onNavigateToMessages?: () => void;
  onStartChatWithPeer?: (peer: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectConversation,
  onOpenSearch,
  onOpenProfile,
  onOpenMessageRequests,
  onOpenFriendRequests,
  onOpenNotifications,
  onNavigateToMessages,
  onStartChatWithPeer,
}) => {
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isUserOnline } = useOnlineStatus();

  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [messageRequestsCount, setMessageRequestsCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tải dữ liệu dashboard tổng hợp
  const loadDashboardData = useCallback(async () => {
    try {
      const [convRes, friendsRes, friendReqRes, msgReqRes, notifRes] = await Promise.all([
        api.get('/conversations').catch(() => ({ data: { conversations: [] } })),
        api.get('/friends').catch(() => ({ data: { friends: [] } })),
        api.get('/friends/requests').catch(() => ({ data: { requests: [] } })),
        api.get('/conversations/requests').catch(() => ({ data: { requests: [] } })),
        api.get('/notifications/unread-count').catch(() => ({ data: { unread_count: 0 } })),
      ]);

      setRecentConversations((convRes.data?.conversations || []).slice(0, 4));
      setFriends(friendsRes.data?.friends || []);
      setFriendRequestsCount(friendReqRes.data?.requests?.length || 0);
      setMessageRequestsCount(msgReqRes.data?.requests?.length || 0);
      setUnreadNotifCount(notifRes.data?.unread_count || 0);
    } catch (err) {
      console.error('Lỗi nạp dashboard home:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Realtime updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      loadDashboardData();
    };

    socket.on('receive_message', handleUpdate);
    socket.on('conversation_updated', handleUpdate);
    socket.on('new_notification', handleUpdate);

    return () => {
      socket.off('receive_message', handleUpdate);
      socket.off('conversation_updated', handleUpdate);
      socket.off('new_notification', handleUpdate);
    };
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Friendly Top Header */}
      <View style={[styles.topHeader, { borderBottomColor: colors.borderLight }]}>
        <Pressable
          onPress={onOpenProfile}
          style={styles.userProfileButton}
          accessibilityRole="button"
          accessibilityLabel="Trang cá nhân"
        >
          <Avatar
            uri={user?.avatar_url}
            name={user?.username}
            size="md"
            showStatus
            isOnline={true}
          />
          <View style={styles.greetingContainer}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              Xin chào 👋
            </Text>
            <Text
              style={[Typography.headline, styles.greetingName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {user?.username || 'Bạn'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.headerRightActions}>
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: pressed ? colors.surfaceHover : colors.surfaceSecondary,
                borderColor: colors.borderLight,
              },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={18}
              color={isDark ? colors.warning : colors.textPrimary}
            />
          </Pressable>

          <Pressable
            onPress={onOpenNotifications}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: pressed ? colors.surfaceHover : colors.surfaceSecondary,
                borderColor: colors.borderLight,
              },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Thông báo"
          >
            <Ionicons name="notifications-outline" size={19} color={colors.textPrimary} />
            {unreadNotifCount > 0 && (
              <View style={styles.headerBadgeWrapper}>
                <Badge count={unreadNotifCount} size="sm" variant="destructive" />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value=""
            placeholder="Tìm kiếm bạn bè hoặc người dùng..."
            onPress={onOpenSearch}
            editable={false}
          />
        </View>

        {/* Quick Action Cards (Friend Requests & Message Requests) */}
        {(friendRequestsCount > 0 || messageRequestsCount > 0) && (
          <View style={styles.quickShortcutsRow}>
            {friendRequestsCount > 0 && (
              <Pressable
                onPress={onOpenFriendRequests}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                  Shadows.sm,
                ]}
              >
                <View style={[styles.shortcutIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="person-add" size={18} color={colors.primary} />
                </View>
                <View style={styles.shortcutInfo}>
                  <Text style={[Typography.bodyMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {friendRequestsCount} lời mời kết bạn
                  </Text>
                  <Text style={[Typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                    Xem ngay →
                  </Text>
                </View>
              </Pressable>
            )}

            {messageRequestsCount > 0 && (
              <Pressable
                onPress={onOpenMessageRequests}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.secondary,
                    opacity: pressed ? 0.85 : 1,
                  },
                  Shadows.sm,
                ]}
              >
                <View style={[styles.shortcutIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                  <Ionicons name="mail-unread" size={18} color={colors.secondary} />
                </View>
                <View style={styles.shortcutInfo}>
                  <Text style={[Typography.bodyMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {messageRequestsCount} tin nhắn chờ
                  </Text>
                  <Text style={[Typography.caption, { color: colors.secondary, fontWeight: '600' }]}>
                    Kiểm tra →
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        )}

        {/* Active Friends Horizontal Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={[Typography.title, { color: colors.textPrimary }]}>
            Bạn bè ({friends.length})
          </Text>
          <Pressable onPress={onOpenSearch} hitSlop={6}>
            <Text style={[Typography.caption, { color: colors.primary, fontWeight: '600' }]}>
              + Tìm bạn mới
            </Text>
          </Pressable>
        </View>

        {friends.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsHorizontalList}
          >
            {friends.map((friend) => {
              const isOnline = isUserOnline(friend.id);
              return (
                <Pressable
                  key={friend.id}
                  onPress={() => onStartChatWithPeer ? onStartChatWithPeer(friend) : onOpenSearch?.()}
                  style={styles.friendStoryItem}
                >
                  <Avatar
                    uri={friend.avatar_url}
                    name={friend.username}
                    size="lg"
                    showStatus
                    isOnline={isOnline}
                  />
                  <Text
                    style={[Typography.caption, styles.friendStoryName, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {friend.username}
                  </Text>
                  <Text
                    style={[
                      styles.friendStatusText,
                      { color: isOnline ? colors.online : colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <Pressable
            onPress={onOpenSearch}
            style={[styles.emptyFriendsBanner, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          >
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: 8 }]}>
              Chưa có bạn bè. Bấm để tìm kiếm và kết bạn ngay!
            </Text>
          </Pressable>
        )}

        {/* Recent Conversations Section (Flat List without boxy card wrapper) */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
          <Text style={[Typography.title, { color: colors.textPrimary }]}>
            Đoạn chat gần đây
          </Text>
          {onNavigateToMessages && (
            <Pressable onPress={onNavigateToMessages} hitSlop={6}>
              <Text style={[Typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                Xem tất cả →
              </Text>
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <Loading message="Đang tải dữ liệu..." />
        ) : recentConversations.length > 0 ? (
          <View style={styles.recentListContainer}>
            {recentConversations.map((conv, index) => (
              <ConversationItem
                key={conv.id}
                id={conv.id}
                peer={{
                  ...conv.peer,
                  is_online: isUserOnline(conv.peer.id),
                }}
                lastMessage={conv.last_message}
                unreadCount={conv.unread_count}
                currentUserId={user?.id}
                onPress={() => onSelectConversation && onSelectConversation(conv)}
                style={{
                  borderBottomWidth: index === recentConversations.length - 1 ? 0 : StyleSheet.hairlineWidth,
                }}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyRecentBox, { borderColor: colors.borderLight }]}>
            <Ionicons name="chatbubbles-outline" size={36} color={colors.textMuted} />
            <Text style={[Typography.bodyMedium, { color: colors.textPrimary, marginTop: Spacing.sm, fontWeight: '600' }]}>
              Chưa có cuộc trò chuyện nào
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: Spacing.md }]}>
              Bạn có thể tìm kiếm bạn bè để bắt đầu trò chuyện.
            </Text>
            <Pressable
              onPress={onOpenSearch}
              style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="search" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={[Typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>
                Tìm bạn bè
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingName: {
    marginTop: 0,
    fontSize: 18,
    lineHeight: 22,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBadgeWrapper: {
    position: 'absolute',
    top: -3,
    right: -3,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 4,
  },
  quickShortcutsRow: {
    paddingHorizontal: Spacing.lg,
    marginTop: 8,
    gap: Spacing.sm,
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  shortcutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutInfo: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 18,
    marginBottom: 8,
  },
  friendsHorizontalList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingVertical: 4,
  },
  friendStoryItem: {
    alignItems: 'center',
    width: 62,
  },
  friendStoryName: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  friendStatusText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  emptyFriendsBanner: {
    marginHorizontal: Spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentListContainer: {
    marginHorizontal: 0,
    marginTop: 2,
  },
  emptyRecentBox: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
