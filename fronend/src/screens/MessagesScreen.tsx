import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import {
  ConversationItem,
  SearchBar,
  EmptyState,
  Loading,
  ErrorState,
} from '../components/common';
import api from '../services/api';
import { getSocket } from '../services/socket';

export interface ConversationItemData {
  id: number;
  status: string;
  unread_count: number;
  updated_at: string;
  peer: {
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
    is_online?: boolean;
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

interface MessagesScreenProps {
  onSelectConversation: (conv: any) => void;
  onOpenSearch: () => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  onSelectConversation,
  onOpenSearch,
}) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { isUserOnline } = useOnlineStatus();

  const [conversations, setConversations] = useState<ConversationItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Tải danh sách cuộc trò chuyện từ Backend
  const fetchConversations = useCallback(async () => {
    try {
      setHasError(false);
      const res = await api.get('/conversations');
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách cuộc trò chuyện:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Lắng nghe realtime socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeMessage = (data: any) => {
      if (!data) return;
      const actualMessage = data.last_message ? data.last_message : data;
      const convId = Number(data.conversation_id || actualMessage.conversation_id);

      if (!convId || !actualMessage) return;

      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => Number(c.id) === convId);

        if (convIndex !== -1) {
          const targetConv = prev[convIndex];
          const isFromPeer = Number(actualMessage.sender_id) !== Number(user?.id);

          if (actualMessage.id && targetConv.last_message?.id === actualMessage.id) {
            return prev;
          }

          const updatedConv: ConversationItemData = {
            ...targetConv,
            last_message: {
              id: actualMessage.id || Date.now(),
              content: actualMessage.content || '',
              message_type: actualMessage.message_type || 'text',
              sender_id: Number(actualMessage.sender_id),
              is_read: Boolean(actualMessage.is_read),
              created_at: actualMessage.created_at || new Date().toISOString(),
            },
            unread_count: isFromPeer ? (targetConv.unread_count || 0) + 1 : targetConv.unread_count,
            updated_at: actualMessage.created_at || new Date().toISOString(),
          };

          const remaining = prev.filter((_, idx) => idx !== convIndex);
          return [updatedConv, ...remaining];
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

    const handleMessagesMarkedRead = (data: { conversation_id: number }) => {
      const convId = Number(data?.conversation_id);
      if (!convId) return;
      setConversations((prev) =>
        prev.map((c) => (Number(c.id) === convId ? { ...c, unread_count: 0 } : c))
      );
    };

    socket.on('receive_message', handleRealtimeMessage);
    socket.on('messages_marked_read', handleMessagesMarkedRead);

    return () => {
      socket.off('receive_message', handleRealtimeMessage);
      socket.off('messages_marked_read', handleMessagesMarkedRead);
    };
  }, [fetchConversations, user?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchConversations();
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

  const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          <Text style={[Typography.headline, { color: colors.textPrimary }]}>
            Đoạn chat
          </Text>
          {totalUnread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={onOpenSearch}
          style={({ pressed }) => [
            styles.headerBtn,
            {
              backgroundColor: pressed ? colors.surfaceHover : colors.surfaceSecondary,
              borderColor: colors.borderLight,
            },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Tìm kiếm"
        >
          <Ionicons name="search-outline" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm cuộc trò chuyện..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Segmented Filter Tabs (Tất cả / Chưa đọc) */}
      <View style={styles.filterTabs}>
        <Pressable
          onPress={() => setFilterMode('all')}
          style={[
            styles.filterTab,
            filterMode === 'all'
              ? [
                  styles.activeFilterTab,
                  { backgroundColor: colors.primary },
                  Shadows.sm,
                ]
              : { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text
            style={[
              Typography.caption,
              {
                color: filterMode === 'all' ? colors.onPrimary : colors.textSecondary,
                fontWeight: '700',
              },
            ]}
          >
            Tất cả ({conversations.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterMode('unread')}
          style={[
            styles.filterTab,
            filterMode === 'unread'
              ? [
                  styles.activeFilterTab,
                  { backgroundColor: colors.primary },
                  Shadows.sm,
                ]
              : { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text
            style={[
              Typography.caption,
              {
                color: filterMode === 'unread' ? colors.onPrimary : colors.textSecondary,
                fontWeight: '700',
              },
            ]}
          >
            Chưa đọc {totalUnread > 0 ? `(${totalUnread})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Body Area */}
      {isLoading ? (
        <Loading message="Đang tải tin nhắn..." />
      ) : hasError ? (
        <ErrorState onRetry={fetchConversations} />
      ) : filteredConversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Chưa có cuộc trò chuyện nào"
          description={
            searchQuery
              ? 'Không tìm thấy kết quả phù hợp với từ khóa.'
              : 'Bạn có thể tìm kiếm bạn bè để bắt đầu trò chuyện.'
          }
          actionTitle={searchQuery ? undefined : 'Tìm bạn bè'}
          onAction={searchQuery ? undefined : onOpenSearch}
        />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ConversationItem
              id={item.id}
              peer={{
                ...item.peer,
                is_online: isUserOnline(item.peer.id),
              }}
              lastMessage={item.last_message}
              unreadCount={item.unread_count}
              onPress={() => {
                setConversations((prev) =>
                  prev.map((c) => (c.id === item.id ? { ...c, unread_count: 0 } : c))
                );
                onSelectConversation(item);
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 150ms ease' } : {}),
  } as any,
  activeFilterTab: {},
  listContent: {
    paddingBottom: Spacing.xxl + 40,
  },
});
