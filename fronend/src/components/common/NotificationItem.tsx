import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Spacing, Radius } from '../../constants/theme';

export interface NotificationItemProps {
  id: number;
  type: 'friend_request' | 'friend_accepted' | 'message_request' | 'new_message' | 'system' | string;
  content: string;
  isRead: boolean;
  timeAgo?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  content,
  isRead,
  timeAgo,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  // Chọn icon và màu phù hợp theo loại thông báo
  const getIconConfig = () => {
    switch (type) {
      case 'friend_request':
        return { name: 'person-add' as const, color: colors.primary, bg: colors.primaryLight };
      case 'friend_accepted':
        return { name: 'checkmark-circle' as const, color: colors.online, bg: 'rgba(16, 185, 129, 0.12)' };
      case 'message_request':
        return { name: 'mail-unread' as const, color: colors.secondary, bg: 'rgba(99, 102, 241, 0.12)' };
      case 'new_message':
        return { name: 'chatbubble-ellipses' as const, color: colors.primary, bg: colors.primaryLight };
      default:
        return { name: 'notifications' as const, color: colors.warning, bg: colors.warningLight };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isRead
            ? pressed
              ? colors.surfaceSecondary
              : colors.surface
            : colors.primaryLight,
          borderBottomColor: colors.borderLight,
        },
        style,
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
        <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
      </View>

      <View style={styles.contentContainer}>
        <Text
          style={[
            Typography.bodyMedium,
            styles.contentText,
            { color: colors.textPrimary },
            !isRead && styles.unreadText,
          ]}
        >
          {content}
        </Text>
        {timeAgo ? (
          <Text style={[Typography.caption, styles.timeText, { color: colors.textMuted }]}>
            {timeAgo}
          </Text>
        ) : null}
      </View>

      {!isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contentText: {
    lineHeight: 20,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: '600',
  },
  timeText: {
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
});
