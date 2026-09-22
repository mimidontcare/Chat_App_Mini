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
import { formatRelativeTime } from '../../utils/date';
import { WebNotificationItemData } from './types';
import api from '../../services/api';

interface WebNotificationPanelProps {
  onOpenFriends: () => void;
  onOpenChatWithPeer?: (peerId: number) => void;
  onOpenMessageRequests?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const WebNotificationPanel: React.FC<WebNotificationPanelProps> = ({
  onOpenFriends,
  onOpenChatWithPeer,
  onOpenMessageRequests,
  onUnreadCountChange,
}) => {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState<WebNotificationItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success) {
        const notifs = res.data.notifications || [];
        setNotifications(notifs);
        const unreadCount = res.data.unread_count ?? notifs.filter((n: any) => !n.is_read).length;
        onUnreadCountChange?.(unreadCount);
      }
    } catch (err) {
      console.error('Lỗi tải thông báo trên Web:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      const remainingUnread = notifications.filter((n) => !n.is_read && n.id !== id).length;
      onUnreadCountChange?.(remainingUnread);
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      // bỏ qua
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onUnreadCountChange?.(0);
      await api.put('/notifications/read-all');
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  const handleItemPress = (notif: WebNotificationItemData) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }

    if (notif.type === 'message_request') {
      onOpenMessageRequests?.();
    } else if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
      onOpenFriends();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'friend_request':
        return { name: 'person-add', color: colors.primary };
      case 'friend_accepted':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'message_request':
        return { name: 'mail', color: '#F59E0B' };
      default:
        return { name: 'notifications', color: colors.primary };
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
          Thông báo
        </Text>

        {notifications.some((n) => !n.is_read) && (
          <Pressable
            onPress={handleMarkAllAsRead}
            style={({ hovered }: any) => [
              styles.markAllBtn,
              hovered && {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
              },
            ]}
            accessibilityLabel="Đánh dấu tất cả đã đọc"
          >
            <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
            <Text style={[styles.markAllBtnText, { color: colors.primary }]}>
              Đã đọc tất cả
            </Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải thông báo...
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons
            name="notifications-off-outline"
            size={44}
            color={isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1'}
          />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Chưa có thông báo nào
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Các thông báo hoạt động và tin nhắn sẽ xuất hiện ở đây.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScrollView}
          contentContainerStyle={styles.listContent}
        >
          {notifications.map((notif) => {
            const iconInfo = getIconForType(notif.type);
            const timeFormatted = formatRelativeTime(notif.created_at);

            return (
              <Pressable
                key={notif.id}
                onPress={() => handleItemPress(notif)}
                style={({ hovered }: any) => [
                  styles.notifItem,
                  {
                    backgroundColor: !notif.is_read
                      ? isDark
                        ? 'rgba(37, 99, 235, 0.08)'
                        : 'rgba(37, 99, 235, 0.05)'
                      : hovered
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(241, 245, 249, 0.8)'
                      : 'transparent',
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(226, 232, 240, 0.6)',
                  },
                ]}
              >
                {/* Icon box */}
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(241, 245, 249, 0.9)',
                    },
                  ]}
                >
                  <Ionicons
                    name={iconInfo.name as any}
                    size={20}
                    color={iconInfo.color}
                  />
                </View>

                {/* Text Content */}
                <View style={styles.notifContent}>
                  <Text
                    style={[
                      styles.notifText,
                      {
                        color: colors.textPrimary,
                        fontWeight: !notif.is_read ? '600' : '400',
                      },
                    ]}
                  >
                    {notif.content}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.textMuted }]}>
                    {timeFormatted}
                  </Text>
                </View>

                {/* Unread indicator dot */}
                {!notif.is_read && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  markAllBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
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
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 12,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        } as any)
      : {}),
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifText: {
    fontSize: 13,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    marginTop: 6,
  },
});
