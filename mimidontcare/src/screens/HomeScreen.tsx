import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getSocket } from '../services/socket';

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
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectConversation,
  onOpenSearch,
  onOpenProfile,
  onOpenMessageRequests,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
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

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Lắng nghe tin nhắn realtime trên Socket để cập nhật danh sách hội thoại
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeMessage = (message: any) => {
      if (!message || !message.conversation_id) return;

      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === message.conversation_id);

        if (convIndex !== -1) {
          // Hội thoại đã có: cập nhật tin nhắn cuối và tăng số tin chưa đọc (nếu đối phương gửi)
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
          // Nếu chưa có hội thoại trong list, gọi tải lại
          fetchConversations();
          return prev;
        }
      });
    };

    socket.on('receive_message', handleRealtimeMessage);
    socket.on('conversation_updated', handleRealtimeMessage);

    return () => {
      socket.off('receive_message', handleRealtimeMessage);
      socket.off('conversation_updated', handleRealtimeMessage);
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

  const formatTimestamp = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.avatarButton} onPress={onOpenProfile} activeOpacity={0.8}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.appTitle}>Đoạn chat</Text>
          <Text style={styles.userStatus}>Đang hoạt động</Text>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={onOpenSearch} activeOpacity={0.7}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bạn bè hoặc tin nhắn..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Action Badges */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionChip, filterMode === 'all' && styles.actionChipActive]}
          onPress={() => setFilterMode('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionChipText, filterMode === 'all' && styles.actionChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionChip, filterMode === 'unread' && styles.actionChipActive]}
          onPress={() => setFilterMode('unread')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.actionChipText,
              filterMode === 'unread' && styles.actionChipTextActive,
            ]}
          >
            Chưa đọc
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionChip}
          onPress={onOpenMessageRequests}
          activeOpacity={0.7}
        >
          <Text style={styles.actionChipText}>Tin nhắn chờ</Text>
        </TouchableOpacity>
      </View>

      {/* Conversations List / Loading / Empty State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />
          }
          renderItem={({ item }) => {
            const isMeLastSender = item.last_message?.sender_id === user?.id;
            const messagePreview = item.last_message
              ? item.last_message.message_type === 'image'
                ? '📷 [Hình ảnh]'
                : (isMeLastSender ? 'Bạn: ' : '') + item.last_message.content
              : 'Bắt đầu cuộc trò chuyện...';

            return (
              <TouchableOpacity
                style={styles.conversationCard}
                onPress={() => onSelectConversation && onSelectConversation(item)}
                activeOpacity={0.7}
              >
                {/* Avatar */}
                {item.peer.avatar_url ? (
                  <Image source={{ uri: item.peer.avatar_url }} style={styles.convAvatar} />
                ) : (
                  <View style={styles.convAvatarPlaceholder}>
                    <Text style={styles.convAvatarText}>
                      {item.peer.username ? item.peer.username.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}

                {/* Content */}
                <View style={styles.convContent}>
                  <View style={styles.convTopRow}>
                    <Text style={styles.peerName} numberOfLines={1}>
                      {item.peer.username}
                    </Text>
                    <Text style={styles.convTime}>
                      {formatTimestamp(item.last_message?.created_at || item.updated_at)}
                    </Text>
                  </View>

                  <View style={styles.convBottomRow}>
                    <Text
                      style={[
                        styles.lastMessageText,
                        item.unread_count > 0 && styles.lastMessageUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {messagePreview}
                    </Text>

                    {item.unread_count > 0 && (
                      <View style={styles.unreadBadge}>
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
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>💬</Text>
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? `Không có tin nhắn nào khớp với "${searchQuery}"`
              : 'Hãy tìm kiếm bạn bè hoặc gửi lời mời để bắt đầu trò chuyện thời gian thực 1-1!'}
          </Text>
          <TouchableOpacity style={styles.startChatButton} onPress={onOpenSearch} activeOpacity={0.8}>
            <Text style={styles.startChatButtonText}>+ Bắt đầu trò chuyện mới</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarButton: {
    marginRight: 12,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  topBarCenter: {
    flex: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  userStatus: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconText: {
    fontSize: 18,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 14,
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 16,
    paddingHorizontal: 6,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  actionChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  actionChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  actionChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  convAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  convAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  convContent: {
    flex: 1,
    marginLeft: 14,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  peerName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  convTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  convBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
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
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  startChatButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
