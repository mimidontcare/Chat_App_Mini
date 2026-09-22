import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { Avatar } from './Avatar';
import { Button } from './Button';

export interface FriendRequestItemProps {
  id: number;
  user: {
    id: number;
    username: string;
    email?: string | null;
    avatar_url?: string | null;
  };
  timeAgo?: string;
  isAccepted?: boolean;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onStartChat?: (user: any) => void;
  style?: ViewStyle;
}

export const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
  id,
  user,
  timeAgo,
  isAccepted = false,
  onAccept,
  onReject,
  onStartChat,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
          borderColor: colors.border,
        },
        Shadows.sm,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <Avatar uri={user.avatar_url} name={user.username} size="md" />
        <View style={styles.infoContainer}>
          <Text style={[Typography.title, styles.username, { color: colors.textPrimary }]}>
            {user.username}
          </Text>
          {user.email ? (
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
          ) : null}
          {timeAgo ? (
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              {timeAgo}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        {isAccepted ? (
          <View style={styles.acceptedBanner}>
            <Text style={[Typography.subtext, { color: colors.online, fontWeight: '600' }]}>
              ✓ Đã trở thành bạn bè
            </Text>
            {onStartChat && (
              <Button
                title="Nhắn tin"
                onPress={() => onStartChat(user)}
                variant="primary"
                size="sm"
                style={styles.chatButton}
              />
            )}
          </View>
        ) : (
          <>
            <Button
              title="Chấp nhận"
              onPress={() => onAccept(id)}
              variant="primary"
              size="sm"
              style={styles.actionBtn}
            />
            <Button
              title="Từ chối"
              onPress={() => onReject(id)}
              variant="secondary"
              size="sm"
              style={styles.actionBtn}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flex: 1,
  },
  acceptedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  chatButton: {
    minWidth: 110,
  },
});
