import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import { EmptyState } from '../components/common';
import api from '../services/api';
import { getSocket } from '../services/socket';

export interface NotificationItem {
  id: number;
  user_id: number;
  type: 'friend_request' | 'friend_accepted' | 'message_request' | 'system';
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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
  const handlePressItem = async (item: NotificationItem) => {
    if (!item.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await api.put(`/notifications/${item.id}/read`);
      } catch (err) {
        // bỏ qua lỗi
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return { name: 'person-add', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'friend_accepted':
        return { name: 'checkmark-circle', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'message_request':
        return { name: 'chatbubble-ellipses', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { name: 'notifications', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return d.toLocaleDateString('vi-VN');
    } catch {
      return '';
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
          <Text style={[Typography.headline, styles.headerTitle, { color: colors.textPrimary }]}>
            Thông Báo
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.badgePill, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgePillText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} hitSlop={6} activeOpacity={0.7}>
            <Text style={[Typography.caption, { color: colors.primary, fontWeight: '600' }]}>
              Đã đọc tất cả
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách thông báo */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const iconConfig = getNotificationIcon(item.type);

            return (
              <TouchableOpacity
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: item.is_read ? colors.surface : colors.surfaceSecondary,
                    borderColor: item.is_read ? colors.borderLight : colors.primary,
                  },
                  Shadows.sm,
                ]}
                onPress={() => handlePressItem(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
                  <Ionicons name={iconConfig.name as any} size={22} color={iconConfig.color} />
                </View>

                <View style={styles.contentContainer}>
                  <Text
                    style={[
                      Typography.body,
                      styles.contentText,
                      {
                        color: colors.textPrimary,
                        fontWeight: item.is_read ? '400' : '600',
                      },
                    ]}
                  >
                    {item.content}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                    {formatTimestamp(item.created_at)}
                  </Text>
                </View>

                {!item.is_read && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="Không có thông báo mới"
              description="Khi có lời mời kết bạn hoặc tin nhắn chờ, thông báo sẽ hiển thị tại đây."
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
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badgePill: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm + 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  contentText: {
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.xs,
  },
});
