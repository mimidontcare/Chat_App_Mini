import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing } from '../constants/theme';
import { EmptyState, Loading, NotificationItem, Badge } from '../components/common';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { formatRelativeTime } from '../utils/date';

export interface NotificationItemData {
  id: number;
  user_id: number;
  type: 'friend_request' | 'friend_accepted' | 'message_request' | 'system' | string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsScreenProps {
  onBack?: () => void;
  onOpenFriendRequests?: () => void;
  onOpenMessageRequests?: () => void;
  onOpenFriends?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onOpenFriendRequests,
  onOpenMessageRequests,
  onOpenFriends,
}) => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Tải danh sách thông báo từ Backend
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách thông báo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 2. Lắng nghe thông báo realtime qua Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (newNotif: any) => {
      setNotifications((prev) => [
        {
          id: newNotif.id || Date.now(),
          user_id: newNotif.user_id || 0,
          type: newNotif.type || 'system',
          content: newNotif.content,
          is_read: false,
          created_at: newNotif.created_at || new Date().toISOString(),
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  // 3. Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await api.put('/notifications/read-all');
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
      await fetchNotifications();
    }
  };

  // 4. Bấm vào một thông báo
  const handlePressItem = async (item: NotificationItemData) => {
    if (!item.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await api.put(`/notifications/${item.id}/read`);
      } catch {
        // bỏ qua
      }
    }

    // Điều hướng tương ứng
    if (item.type === 'friend_request' && onOpenFriendRequests) {
      onOpenFriendRequests();
    } else if (item.type === 'message_request' && onOpenMessageRequests) {
      onOpenMessageRequests();
    } else if (item.type === 'friend_accepted' && onOpenFriends) {
      onOpenFriends();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <Pressable
              onPress={onBack}
              style={styles.backBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Trở về"
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
          )}
          <Text style={[Typography.headline, { color: colors.textPrimary }]}>
            Thông báo
          </Text>
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="sm" variant="primary" />
          )}
        </View>

        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllAsRead} hitSlop={6}>
            <Text style={[Typography.caption, { color: colors.primary, fontWeight: '600' }]}>
              Đã đọc tất cả
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main Stream */}
      {isLoading ? (
        <Loading message="Đang tải thông báo..." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <NotificationItem
              id={item.id}
              type={item.type}
              content={item.content}
              isRead={item.is_read}
              timeAgo={formatRelativeTime(item.created_at)}
              onPress={() => handlePressItem(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="Không có thông báo nào"
              description="Khi có lời mời kết bạn hoặc tin nhắn mới, bạn sẽ nhận được thông báo tại đây."
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  listContent: {
    flexGrow: 1,
  },
});
