import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { formatConversationTime } from '../../utils/date';
import { WebConversationItemData } from './types';

export type WebConversationFilterMode = 'all' | 'unread' | 'requests';

interface WebConversationListProps {
  conversations: WebConversationItemData[];
  selectedConversationId: number | null;
  onSelectConversation: (conv: WebConversationItemData) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: WebConversationFilterMode;
  onFilterChange: (mode: WebConversationFilterMode) => void;
  onStartNewChat: () => void;
}

export const WebConversationList: React.FC<WebConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterChange,
  onStartNewChat,
}) => {
  const { colors, isDark } = useTheme();

  // Count message requests from strangers
  const requestsTotal = conversations.filter(
    (c) => c.is_request === true || c.status === 'message_request'
  ).length;

  // Filter conversations by search query & filter mode
  const filteredConversations = conversations.filter((conv) => {
    const peerName = conv.peer?.username || '';
    const lastMsg = conv.last_message?.content || '';
    const matchesSearch =
      peerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsg.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'unread') {
      return (conv.unread_count || 0) > 0;
    }
    if (filterMode === 'requests') {
      return conv.is_request === true || conv.status === 'message_request';
    }
    return true;
  });

  const unreadTotal = conversations.reduce(
    (acc, curr) => acc + (curr.unread_count > 0 ? 1 : 0),
    0
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0F1626' : '#F8FAFC',
          borderRightColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(226, 232, 240, 0.9)',
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Đoạn chat
          </Text>
          <Pressable
            onPress={onStartNewChat}
            style={({ hovered }: any) => [
              styles.actionBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(241, 245, 249, 0.9)',
              },
              hovered && {
                backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.12)',
              },
            ]}
            accessibilityLabel="Bắt đầu cuộc trò chuyện mới"
          >
            <Ionicons name="create-outline" size={19} color={colors.primary} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? '#141D30' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
            },
          ]}
        >
          <Ionicons name="search-outline" size={17} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => onSearchChange('')}
              style={styles.clearSearchBtn}
            >
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => onFilterChange('all')}
            style={[
              styles.filterPill,
              filterMode === 'all'
                ? [
                    styles.filterPillActive,
                    { backgroundColor: isDark ? '#23304B' : '#E2E8F0' },
                  ]
                : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                {
                  color:
                    filterMode === 'all' ? colors.textPrimary : colors.textSecondary,
                  fontWeight: filterMode === 'all' ? '600' : '500',
                },
              ]}
            >
              Tất cả ({conversations.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onFilterChange('unread')}
            style={[
              styles.filterPill,
              filterMode === 'unread'
                ? [
                    styles.filterPillActive,
                    { backgroundColor: isDark ? '#23304B' : '#E2E8F0' },
                  ]
                : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                {
                  color:
                    filterMode === 'unread' ? colors.textPrimary : colors.textSecondary,
                  fontWeight: filterMode === 'unread' ? '600' : '500',
                },
              ]}
            >
              Chưa đọc {unreadTotal > 0 ? `(${unreadTotal})` : ''}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onFilterChange('requests')}
            style={[
              styles.filterPill,
              filterMode === 'requests'
                ? [
                    styles.filterPillActive,
                    { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' },
                  ]
                : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                {
                  color:
                    filterMode === 'requests' ? '#F59E0B' : colors.textSecondary,
                  fontWeight: filterMode === 'requests' ? '700' : '500',
                },
              ]}
            >
              Tin nhắn chờ {requestsTotal > 0 ? `(${requestsTotal})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Conversation Items List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải cuộc trò chuyện...
          </Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={40}
            color={isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1'}
          />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {searchQuery
              ? 'Hãy thử tìm bằng từ khóa hoặc tên người dùng khác.'
              : 'Hãy kết bạn hoặc tìm kiếm người dùng để bắt đầu trò chuyện.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScrollView}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        >
          {filteredConversations.map((conv) => {
            const isSelected = selectedConversationId === conv.id;
            const peer = conv.peer || { username: 'Người dùng' };
            const isUnread = (conv.unread_count || 0) > 0;
            const timeFormatted = formatConversationTime(
              conv.last_message?.created_at || conv.updated_at
            );

            // Last message preview text
            let lastMessagePreview = 'Chưa có tin nhắn';
            if (conv.last_message) {
              if (conv.last_message.message_type === 'image') {
                lastMessagePreview = '📷 [Hình ảnh]';
              } else {
                lastMessagePreview = conv.last_message.content || 'Đã gửi tin nhắn';
              }
            }

            return (
              <Pressable
                key={conv.id}
                onPress={() => onSelectConversation(conv)}
                style={({ hovered }: any) => [
                  styles.convItem,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#1A253C'
                        : '#EDF2F7'
                      : hovered
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(241, 245, 249, 0.8)'
                      : 'transparent',
                  },
                ]}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <View
                    style={[
                      styles.itemActiveIndicator,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}

                {/* Avatar with Online Status */}
                <View style={styles.avatarWrapper}>
                  <Avatar
                    uri={peer.avatar_url}
                    name={peer.username}
                    size={46}
                    isOnline={peer.is_online}
                  />
                </View>

                {/* Content: Peer name & Last message snippet */}
                <View style={styles.itemContent}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.itemTitleRow}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.itemUsername,
                          {
                            color: colors.textPrimary,
                            fontWeight: isUnread ? '700' : '600',
                          },
                        ]}
                      >
                        {peer.username}
                      </Text>
                      {(conv.is_request || conv.status === 'message_request') && (
                        <View style={styles.requestTag}>
                          <Text style={styles.requestTagText}>Chờ duyệt</Text>
                        </View>
                      )}
                    </View>
                    {timeFormatted ? (
                      <Text
                        style={[
                          styles.itemTime,
                          {
                            color: isUnread ? colors.primary : colors.textMuted,
                            fontWeight: isUnread ? '600' : '400',
                          },
                        ]}
                      >
                        {timeFormatted}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.itemBottomRow}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.itemLastMsg,
                        {
                          color: isUnread
                            ? colors.textPrimary
                            : colors.textSecondary,
                          fontWeight: isUnread ? '600' : '400',
                        },
                      ]}
                    >
                      {lastMessagePreview}
                    </Text>

                    {/* Unread badge */}
                    {isUnread && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 340,
    height: '100%',
    borderRightWidth: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        } as any)
      : {}),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  clearSearchBtn: {
    padding: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  filterPillActive: {},
  filterPillText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    textAlign: 'center' as any,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  listScrollView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 6,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: 'relative',
    gap: 12,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        } as any)
      : {}),
  },
  itemActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3.5,
    borderRadius: 9999,
  },
  avatarWrapper: {
    position: 'relative',
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
    gap: 6,
  },
  requestTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  requestTagText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  itemUsername: {
    fontSize: 14,
    flexShrink: 1,
  },
  itemTime: {
    fontSize: 11,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLastMsg: {
    fontSize: 12.5,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
