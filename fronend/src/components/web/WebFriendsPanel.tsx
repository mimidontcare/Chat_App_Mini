import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { WebFriendItemData, WebFriendRequestItemData, WebPeerData } from './types';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

interface WebFriendsPanelProps {
  onStartChat: (peer: WebPeerData) => void;
  onRequestCountChange?: (count: number) => void;
}

export const WebFriendsPanel: React.FC<WebFriendsPanelProps> = ({
  onStartChat,
  onRequestCountChange,
}) => {
  const { colors, isDark } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<WebFriendItemData[]>([]);
  const [requests, setRequests] = useState<WebFriendRequestItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [friendsRes, reqsRes] = await Promise.all([
        api.get('/friends').catch(() => ({ data: { friends: [] } })),
        api.get('/friends/requests').catch(() => ({ data: { requests: [] } })),
      ]);

      const friendList = friendsRes.data?.friends || [];
      const reqList = reqsRes.data?.requests || [];

      setFriends(friendList);
      setRequests(reqList);
      onRequestCountChange?.(reqList.length);

      // Trigger online status check for loaded friends
      const socket = getSocket();
      if (socket) {
        socket.emit('get_online_users');
      }
    } catch {
      setFriends([]);
      setRequests([]);
      onRequestCountChange?.(0);
    } finally {
      setIsLoading(false);
    }
  }, [onRequestCountChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time socket listeners for online / offline status
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsersList = (onlineIds: number[]) => {
      if (!Array.isArray(onlineIds)) return;
      const idSet = new Set(onlineIds.map(Number));
      setFriends((prev) =>
        prev.map((f) => ({
          ...f,
          is_online: idSet.has(Number(f.id)),
        }))
      );
    };

    const handleUserOnline = (data: { userId: number }) => {
      const uid = Number(data?.userId);
      if (!uid) return;
      setFriends((prev) =>
        prev.map((f) => (Number(f.id) === uid ? { ...f, is_online: true } : f))
      );
    };

    const handleUserOffline = (data: { userId: number }) => {
      const uid = Number(data?.userId);
      if (!uid) return;
      setFriends((prev) =>
        prev.map((f) => (Number(f.id) === uid ? { ...f, is_online: false } : f))
      );
    };

    socket.on('online_users_list', handleOnlineUsersList);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    socket.emit('get_online_users');

    return () => {
      socket.off('online_users_list', handleOnlineUsersList);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, []);

  const handleAccept = async (requestId: number, sender: any) => {
    try {
      setProcessingId(requestId);
      const res = await api.post(`/friends/requests/${requestId}/accept`);
      if (res.data?.success) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        onRequestCountChange?.(requests.length - 1);
        // Add to friends list
        setFriends((prev) => [
          ...prev,
          {
            id: sender.id,
            username: sender.username,
            email: sender.email,
            avatar_url: sender.avatar_url,
            is_online: true,
          },
        ]);
      }
    } catch (err) {
      console.error('Lỗi chấp nhận lời mời:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const res = await api.post(`/friends/requests/${requestId}/reject`);
      if (res.data?.success) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        onRequestCountChange?.(requests.length - 1);
      }
    } catch (err) {
      console.error('Lỗi từ chối lời mời:', err);
    } finally {
      setProcessingId(null);
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Danh bạ bạn bè
        </Text>

        {/* Sub-tabs */}
        <View style={styles.subTabRow}>
          <Pressable
            onPress={() => setActiveSubTab('friends')}
            style={[
              styles.subTabBtn,
              activeSubTab === 'friends'
                ? [
                    styles.subTabBtnActive,
                    { backgroundColor: isDark ? '#23304B' : '#E2E8F0' },
                  ]
                : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                {
                  color:
                    activeSubTab === 'friends'
                      ? colors.textPrimary
                      : colors.textSecondary,
                  fontWeight: activeSubTab === 'friends' ? '600' : '500',
                },
              ]}
            >
              Bạn bè ({friends.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveSubTab('requests')}
            style={[
              styles.subTabBtn,
              activeSubTab === 'requests'
                ? [
                    styles.subTabBtnActive,
                    { backgroundColor: isDark ? '#23304B' : '#E2E8F0' },
                  ]
                : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                {
                  color:
                    activeSubTab === 'requests'
                      ? colors.textPrimary
                      : colors.textSecondary,
                  fontWeight: activeSubTab === 'requests' ? '600' : '500',
                },
              ]}
            >
              Lời mời {requests.length > 0 ? `(${requests.length})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải dữ liệu bạn bè...
          </Text>
        </View>
      ) : activeSubTab === 'friends' ? (
        /* Friends List */
        friends.length === 0 ? (
          <View style={styles.emptyView}>
            <Ionicons
              name="people-outline"
              size={44}
              color={isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1'}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Chưa có bạn bè nào
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Hãy tìm kiếm người dùng khác để kết nối và trò chuyện.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.listScrollView}
            contentContainerStyle={styles.listContent}
          >
            {friends.map((friend) => (
              <View
                key={friend.id}
                style={[
                  styles.friendItem,
                  {
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(226, 232, 240, 0.6)',
                  },
                ]}
              >
                <Avatar
                  uri={friend.avatar_url}
                  name={friend.username}
                  size={44}
                  isOnline={friend.is_online}
                />

                <View style={styles.friendInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.friendName, { color: colors.textPrimary }]}
                  >
                    {friend.username}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.friendStatus, { color: colors.textSecondary }]}
                  >
                    {friend.is_online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                  </Text>
                </View>

                {/* Direct Chat Button */}
                <Pressable
                  onPress={() => onStartChat(friend)}
                  style={({ hovered }: any) => [
                    styles.chatBtn,
                    { backgroundColor: colors.primary },
                    hovered && { transform: [{ scale: 1.05 }] },
                  ]}
                  accessibilityLabel={`Nhắn tin với ${friend.username}`}
                >
                  <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
                  <Text style={styles.chatBtnText}>Nhắn tin</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )
      ) : (
        /* Friend Requests List */
        requests.length === 0 ? (
          <View style={styles.emptyView}>
            <Ionicons
              name="mail-outline"
              size={44}
              color={isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1'}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Không có lời mời nào
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Khi có người gửi lời mời kết bạn, bạn sẽ thấy tại đây.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.listScrollView}
            contentContainerStyle={styles.listContent}
          >
            {requests.map((req) => (
              <View
                key={req.id}
                style={[
                  styles.requestItem,
                  {
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(226, 232, 240, 0.6)',
                  },
                ]}
              >
                <Avatar
                  uri={req.sender?.avatar_url}
                  name={req.sender?.username || 'User'}
                  size={44}
                />

                <View style={styles.requestInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.friendName, { color: colors.textPrimary }]}
                  >
                    {req.sender?.username}
                  </Text>
                  <Text style={[styles.friendStatus, { color: colors.textSecondary }]}>
                    Đã gửi lời mời kết bạn
                  </Text>

                  {/* Actions */}
                  <View style={styles.requestActions}>
                    <Pressable
                      onPress={() => handleAccept(req.id, req.sender)}
                      disabled={processingId === req.id}
                      style={[
                        styles.reqActionBtn,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      {processingId === req.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.reqActionBtnText}>Chấp nhận</Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                      style={[
                        styles.reqActionBtn,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reqActionBtnTextSecondary,
                          { color: colors.textPrimary },
                        ]}
                      >
                        Xóa
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  subTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  subTabBtnActive: {},
  subTabText: {
    fontSize: 12.5,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
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
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendStatus: {
    fontSize: 11.5,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        } as any)
      : {}),
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  requestInfo: {
    flex: 1,
    gap: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  reqActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'opacity 0.15s ease',
        } as any)
      : {}),
  },
  reqActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reqActionBtnTextSecondary: {
    fontSize: 12,
    fontWeight: '500',
  },
});
