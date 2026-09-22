import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../../constants/theme';
import { MockMessage } from '../../constants/mockData';
import { isOnlyEmojis } from '../../constants/emojis';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_BUBBLE_WIDTH = Math.min(SCREEN_WIDTH * 0.76, 520);

export interface ChatBubbleProps {
  message: MockMessage | any;
  isMine: boolean;
  onImagePress?: (url: string) => void;
  onReactionPress?: (message: any) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isMine,
  onImagePress,
  onReactionPress,
}) => {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isImage = message.message_type === 'image' && !!message.image_url;
  const emojiInfo = !isImage && message.content ? isOnlyEmojis(message.content) : { isOnly: false, count: 0 };

  const getJumboFontSize = (count: number) => {
    if (count === 1) return 48;
    if (count === 2) return 38;
    return 32;
  };

  return (
    <View
      style={[
        styles.row,
        isMine ? styles.rowMine : styles.rowTheir,
      ]}
      {...(Platform.OS === 'web'
        ? ({
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
          } as any)
        : null)}
    >
      {/* Reaction Trigger Button (Bên trái khi là tin nhắn của mình) */}
      {isMine && onReactionPress && (
        <Pressable
          onPress={() => onReactionPress(message)}
          style={[
            styles.reactionTriggerBtn,
            styles.triggerLeft,
            { backgroundColor: colors.surfaceSecondary },
            (isHovered || Platform.OS !== 'web') ? styles.triggerVisible : styles.triggerHidden,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Thả biểu cảm"
        >
          <Ionicons name="happy-outline" size={16} color={colors.textMuted} />
        </Pressable>
      )}

      {/* Bong bóng tin nhắn */}
      <View style={styles.bubbleWrapper}>
        <Pressable
          onLongPress={() => onReactionPress && onReactionPress(message)}
          style={[
            styles.bubbleBase,
            emojiInfo.isOnly
              ? styles.jumboBubble
              : isMine
              ? [
                  styles.bubbleMine,
                  {
                    backgroundColor: colors.outgoingBubble,
                    ...(Shadows.sm as any),
                  },
                  Platform.OS === 'web'
                    ? ({
                        backgroundImage: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                        boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
                      } as any)
                    : null,
                ]
              : [
                  styles.bubbleTheir,
                  {
                    backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
                    borderColor: isDark ? colors.borderLight : colors.border,
                    borderWidth: 1,
                    ...(Shadows.sm as any),
                  },
                ],
            isImage && styles.imageBubblePadding,
          ]}
        >
          {/* Render Image Message */}
          {isImage ? (
            <Pressable
              onPress={() => onImagePress && message.image_url && onImagePress(message.image_url)}
              style={styles.imageContainer}
              accessibilityRole="imagebutton"
              accessibilityLabel="Xem ảnh kích thước đầy đủ"
            >
              <Image
                source={{ uri: message.image_url }}
                style={styles.messageImage}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ) : null}

          {/* Render Text / Jumbo Emoji Content */}
          {message.content && !isImage ? (
            emojiInfo.isOnly ? (
              <Text
                style={[
                  styles.jumboEmojiText,
                  {
                    fontSize: getJumboFontSize(emojiInfo.count),
                    lineHeight: getJumboFontSize(emojiInfo.count) + 8,
                  },
                ]}
              >
                {message.content}
              </Text>
            ) : (
              <Text
                style={[
                  Typography.body,
                  styles.messageText,
                  isMine ? styles.textMine : styles.textTheir,
                  { color: isMine ? colors.outgoingBubbleText : colors.textPrimary },
                ]}
              >
                {message.content}
              </Text>
            )
          ) : null}

          {/* Timestamp & Status Metadata */}
          <View style={styles.metaRow}>
            <Text
              style={[
                Typography.caption,
                {
                  color: emojiInfo.isOnly
                    ? colors.textSecondary
                    : isMine
                    ? 'rgba(255, 255, 255, 0.8)'
                    : colors.textSecondary,
                  fontSize: 10,
                  fontWeight: '500',
                },
              ]}
            >
              {message.created_at}
            </Text>

            {isMine && (
              <View style={styles.statusTickWrapper}>
                {message.is_read ? (
                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={emojiInfo.isOnly ? colors.primary : colors.readTick}
                  />
                ) : (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={emojiInfo.isOnly ? colors.textSecondary : 'rgba(255, 255, 255, 0.75)'}
                  />
                )}
              </View>
            )}
          </View>
        </Pressable>

        {/* Reaction Badge góc dưới bong bóng (chuẩn Messenger floating pill) */}
        {message.reaction ? (
          <Pressable
            onPress={() => onReactionPress && onReactionPress(message)}
            style={[
              styles.reactionBadge,
              isMine ? styles.reactionBadgeMine : styles.reactionBadgeTheir,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              Shadows.sm,
            ]}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`Cảm xúc ${message.reaction}`}
          >
            <Text style={styles.reactionBadgeEmoji}>{message.reaction}</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Reaction Trigger Button (Bên phải khi là tin nhắn của đối phương) */}
      {!isMine && onReactionPress && (
        <Pressable
          onPress={() => onReactionPress(message)}
          style={[
            styles.reactionTriggerBtn,
            styles.triggerRight,
            { backgroundColor: colors.surfaceSecondary },
            (isHovered || Platform.OS !== 'web') ? styles.triggerVisible : styles.triggerHidden,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Thả biểu cảm"
        >
          <Ionicons name="happy-outline" size={16} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: 3,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheir: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    position: 'relative',
  },
  bubbleBase: {
    maxWidth: MAX_BUBBLE_WIDTH,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 1,
    minWidth: 70,
  },
  jumboBubble: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    elevation: 0,
    shadowOpacity: 0,
  },
  bubbleMine: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xs,
  },
  bubbleTheir: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xs,
    borderBottomRightRadius: Radius.xl,
  },
  imageBubblePadding: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: Spacing.xs + 2,
  },
  imageContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: 4,
  },
  messageImage: {
    width: 220,
    height: 170,
    borderRadius: Radius.lg,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMine: {
    fontWeight: '400',
  },
  textTheir: {
    fontWeight: '400',
  },
  jumboEmojiText: {
    textAlign: 'center',
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    gap: 3,
  },
  statusTickWrapper: {
    marginLeft: 2,
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -9,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    zIndex: 10,
  },
  reactionBadgeMine: {
    right: 8,
  },
  reactionBadgeTheir: {
    left: 8,
  },
  reactionBadgeEmoji: {
    fontSize: 13,
  },
  reactionTriggerBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  triggerLeft: {},
  triggerRight: {},
  triggerVisible: {
    opacity: 1,
  },
  triggerHidden: {
    opacity: 0,
  },
});
