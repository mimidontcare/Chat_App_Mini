import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { Avatar, EmptyState } from '../components/common';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { formatConversationTime } from '../utils/date';

export interface ConversationItem {
  id: number;
  status: string;
  unread_count: number;
  updated_at: string;
  peer: {
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
  };
  last_message: {
    id: number;
    content: string;
    message_type: 'text' | 'image';
    sender_id: number;
    is_read: boolean;
    created_at: string;
  } | null;
}

interface HomeScreenProps {
  onSelectConversation?: (conv: any) => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenMessageRequests?: () => void;
  onOpenFriendRequests?: () => void;
  onOpenNotifications?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectConversation,
  onOpenSearch,
  onOpenProfile,
  onOpenMessageRequests,
  onOpenNotifications,
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Lấy danh sách đoạn chat từ Backend
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/conversations');
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách cuộc trò chuyện:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lấy số lượng thông báo chưa đọc
  const fetchUnreadNotifCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success) {
        setUnreadNotifCount(res.data.unread_count || 0);
      }
    } catch {
      // bỏ qua lỗi
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchUnreadNotifCount();
  }, [fetchConversations, fetchUnreadNotifCount]);

  // Lắng nghe tin nhắn & thông báo realtime trên Socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeMessage = (message: any) => {
      if (!message || !message.conversation_id) return;

      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === message.conversation_id);

        if (convIndex !== -1) {
          const targetConv = prev[convIndex];
          const isFromPeer = message.sender_id !== user?.id;

          const updatedConv: ConversationItem = {
            ...targetConv,
            last_message: message,
            unread_count: isFromPeer ? (targetConv.unread_count || 0) + 1 : targetConv.unread_count,
            updated_at: message.created_at || new Date().toISOString(),
          };

          const remaining = prev.filter((_, idx) => idx !== convIndex);
          return [updatedConv, ...remaining];
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

    const handleNewNotification = () => {
      setUnreadNotifCount((prev) => prev + 1);
    };

    socket.on('receive_message', handleRealtimeMessage);
    socket.on('conversation_updated', handleRealtimeMessage);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('receive_message', handleRealtimeMessage);
      socket.off('conversation_updated', handleRealtimeMessage);
      socket.off('new_notification', handleNewNotification);
    };
  }, [fetchConversations, user?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchConversations(), fetchUnreadNotifCount()]);
    setIsRefreshing(false);
  };

  // Lọc theo search và badge unread
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.peer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.last_message?.content || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === 'unread') {
      return matchesSearch && c.unread_count > 0;
    }
    return matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.avatarButton} onPress={onOpenProfile} activeOpacity={0.8}>
          <Avatar
            uri={user?.avatar_url}
            name={user?.username}
            size="sm"
            showStatus
            isOnline={true}
          />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={[Typography.headline, styles.appTitle, { color: colors.textPrimary }]}>
            Đoạn chat
          </Text>
          <Text style={[Typography.caption, { color: colors.online }]}>
            Đang hoạt động
          </Text>
        </View>

        <View style={styles.topBarRightActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
            accessibilityLabel="Thông báo"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
            {unreadNotifCount > 0 && (
              <View style={[styles.bellBadge, { backgroundColor: colors.unreadBadge }]}>
                <Text style={styles.bellBadgeText}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, marginLeft: 8 }]}
            onPress={onOpenSearch}
            activeOpacity={0.7}
            accessibilityLabel="Tìm kiếm"
          >
            <Ionicons name="search-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[Typography.body, styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Tìm kiếm bạn bè hoặc tin nhắn..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={6}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Action Badges */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[
            styles.actionChip,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            filterMode === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
          onPress={() => setFilterMode('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              Typography.caption,
              styles.actionChipText,
              { color: filterMode === 'all' ? colors.onPrimary : colors.textSecondary },
              filterMode === 'all' && styles.actionChipTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionChip,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            filterMode === 'unread' && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
          onPress={() => setFilterMode('unread')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              Typography.caption,
              styles.actionChipText,
              { color: filterMode === 'unread' ? colors.onPrimary : colors.textSecondary },
              filterMode === 'unread' && styles.actionChipTextActive,
            ]}
          >
            Chưa đọc
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionChip, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={onOpenMessageRequests}
          activeOpacity={0.7}
        >
          <Text style={[Typography.caption, styles.actionChipText, { color: colors.textSecondary }]}>
            Tin nhắn chờ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversations List / Loading / Empty State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={({ item }) => {
            const isMeLastSender = item.last_message?.sender_id === user?.id;
            const messagePreview = item.last_message
              ? item.last_message.message_type === 'image'
                ? '📷 [Hình ảnh]'
                : (isMeLastSender ? 'Bạn: ' : '') + item.last_message.content
              : 'Bắt đầu cuộc trò chuyện...';

            return (
              <TouchableOpacity
                style={[
                  styles.conversationCard,
                  { backgroundColor: colors.surface, borderColor: colors.borderLight },
                  Shadows.sm,
                ]}
                onPress={() => onSelectConversation && onSelectConversation(item)}
                activeOpacity={0.7}
              >
                {/* Avatar */}
                <Avatar
                  uri={item.peer.avatar_url}
                  name={item.peer.username}
                  size="md"
                />

                {/* Content */}
                <View style={styles.convContent}>
                  <View style={styles.convTopRow}>
                    <Text
                      style={[
                        Typography.title,
                        styles.peerName,
                        { color: colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.peer.username}
                    </Text>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                      {formatConversationTime(item.last_message?.created_at || item.updated_at)}
                    </Text>
                  </View>

                  <View style={styles.convBottomRow}>
                    <Text
                      style={[
                        Typography.bodyMedium,
                        styles.lastMessageText,
                        { color: item.unread_count > 0 ? colors.textPrimary : colors.textSecondary },
                        item.unread_count > 0 && styles.lastMessageUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {messagePreview}
                    </Text>

                    {item.unread_count > 0 && (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.unreadBadgeText}>
                          {item.unread_count > 99 ? '99+' : item.unread_count}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="chatbubbles-outline"
            title={searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
            description={
              searchQuery
                ? `Không có tin nhắn nào khớp với "${searchQuery}"`
                : 'Hãy tìm kiếm bạn bè hoặc gửi lời mời để bắt đầu trò chuyện thời gian thực 1-1!'
            }
            actionTitle="+ Bắt đầu trò chuyện mới"
            onAction={onOpenSearch}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  avatarButton: {
    marginRight: Spacing.sm,
  },
  topBarCenter: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  topBarRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  actionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  actionChipText: {
    fontWeight: '500',
  },
  actionChipTextActive: {
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  convContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  peerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.xs,
  },
  convBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 13,
    flex: 1,
    marginRight: Spacing.xs,
  },
  lastMessageUnread: {
    fontWeight: '700',
  },
  unreadBadge: {
    borderRadius: Radius.pill,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
