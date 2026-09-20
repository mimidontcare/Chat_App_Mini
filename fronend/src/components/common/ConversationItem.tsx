import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Spacing, Radius } from '../../constants/theme';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface ConversationItemProps {
  id: number;
  peer: {
    id: number;
    username: string;
    avatar_url?: string | null;
    is_online?: boolean;
  };
  lastMessage?: {
    content: string;
    message_type: 'text' | 'image';
    created_at: string;
    is_read?: boolean;
    sender_id?: number;
  } | null;
  unreadCount?: number;
  currentUserId?: number;
  onPress: () => void;
  style?: ViewStyle;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  peer,
  lastMessage,
  unreadCount = 0,
  currentUserId,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  // Format thời gian ngắn gọn
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
      }
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const isSentByMe = lastMessage?.sender_id === currentUserId;
  const isUnread = unreadCount > 0;

  const renderLastMessageContent = () => {
    if (!lastMessage) {
      return 'Bắt đầu cuộc trò chuyện...';
    }
    if (lastMessage.message_type === 'image') {
      return isSentByMe ? 'Bạn đã gửi một ảnh' : `${peer.username} đã gửi một ảnh`;
    }
    return (isSentByMe ? 'Bạn: ' : '') + lastMessage.content;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? colors.surfaceSecondary
            : 'transparent',
          borderBottomColor: colors.borderLight,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Trò chuyện với ${peer.username}`}
    >
      <View style={styles.avatarWrapper}>
        <Avatar
          uri={peer.avatar_url}
          name={peer.username}
          size="md"
          showStatus
          isOnline={!!peer.is_online}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text
            style={[
              Typography.title,
              styles.name,
              { color: colors.textPrimary },
              isUnread && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {peer.username}
          </Text>
          <Text
            style={[
              Typography.caption,
              styles.time,
              { color: isUnread ? colors.primary : colors.textMuted },
            ]}
          >
            {formatTime(lastMessage?.created_at)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              Typography.subtext,
              styles.preview,
              { color: isUnread ? colors.textPrimary : colors.textSecondary },
              isUnread && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {renderLastMessageContent()}
          </Text>

          {isUnread ? (
            <Badge count={unreadCount} size="sm" variant="destructive" />
          ) : isSentByMe && lastMessage?.is_read ? (
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarWrapper: {
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  time: {
    flexShrink: 0,
  },
  preview: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadText: {
    fontWeight: '700',
  },
});
