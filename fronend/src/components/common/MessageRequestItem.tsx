import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Spacing, Radius } from '../../constants/theme';
import { Avatar } from './Avatar';
import { Button } from './Button';

export interface MessageRequestItemProps {
  id: number;
  peer: {
    id: number;
    username: string;
    avatar_url?: string | null;
  };
  lastMessage?: {
    content: string;
    message_type: 'text' | 'image';
    created_at: string;
  } | null;
  timeAgo?: string;
  onOpen: () => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  style?: ViewStyle;
}

export const MessageRequestItem: React.FC<MessageRequestItemProps> = ({
  id,
  peer,
  lastMessage,
  timeAgo,
  onOpen,
  onAccept,
  onReject,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Pressable onPress={onOpen} style={styles.contentPressable}>
        <Avatar uri={peer.avatar_url} name={peer.username} size="md" />

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={[Typography.title, styles.username, { color: colors.textPrimary }]}>
              {peer.username}
            </Text>
            {timeAgo ? (
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                {timeAgo}
              </Text>
            ) : null}
          </View>

          <Text
            style={[Typography.subtext, styles.preview, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {lastMessage?.message_type === 'image'
              ? '[Hình ảnh]'
              : lastMessage?.content || 'Đã gửi một tin nhắn cho bạn'}
          </Text>
        </View>
      </Pressable>

      <View style={styles.actionsRow}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  contentPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  username: {
    flex: 1,
  },
  preview: {
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
