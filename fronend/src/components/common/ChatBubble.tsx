import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../../constants/theme';
import { MockMessage } from '../../constants/mockData';
import { isOnlyEmojis } from '../../constants/emojis';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.74;

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
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isImage = message.message_type === 'image' && !!message.image_url;
  const emojiInfo = !isImage && message.content ? isOnlyEmojis(message.content) : { isOnly: false, count: 0 };

  const getJumboFontSize = (count: number) => {
    if (count === 1) return 46;
    if (count === 2) return 38;
    return 30;
  };

  return (
    <View
      style={[
        styles.row,
        isMine ? styles.rowMine : styles.rowTheir,
      ]}
      // Web hover events
      {...(Platform.OS === 'web'
        ? ({
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
          } as any)
        : null)}
    >
      {/* Reaction Trigger Button (Bên trái bubble khi là tin nhắn của mình) */}
      {isMine && onReactionPress && (
        <Pressable
          onPress={() => onReactionPress(message)}
          style={[
            styles.reactionTriggerBtn,
            styles.triggerLeft,
            (isHovered || Platform.OS !== 'web') ? styles.triggerVisible : styles.triggerHidden,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Thả biểu cảm"
        >
          <Ionicons name="happy-outline" size={17} color={colors.textPlaceholder} />
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
                  { backgroundColor: colors.outgoingBubble },
                  Shadows.sm,
                ]
              : [
                  styles.bubbleTheir,
                  { backgroundColor: colors.incomingBubble },
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
                  isMine ? styles.textMine : styles.textTheir,
                  { color: isMine ? colors.outgoingBubbleText : colors.incomingBubbleText },
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
                    ? 'rgba(255, 255, 255, 0.75)'
                    : colors.textSecondary,
                  fontSize: 11,
                },
              ]}
            >
              {message.created_at}
            </Text>

            {isMine && (
              <View style={styles.statusTickWrapper}>
                {message.is_read ? (
                  <Ionicons name="checkmark-done" size={14} color={emojiInfo.isOnly ? colors.primary : colors.readTick} />
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

        {/* Reaction Badge góc dưới bong bóng (chuẩn Messenger) */}
        {message.reaction ? (
          <Pressable
            onPress={() => onReactionPress && onReactionPress(message)}
            style={[
              styles.reactionBadge,
              isMine ? styles.reactionBadgeMine : styles.reactionBadgeTheir,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
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

      {/* Reaction Trigger Button (Bên phải bubble khi là tin nhắn của đối phương) */}
      {!isMine && onReactionPress && (
        <Pressable
          onPress={() => onReactionPress(message)}
          style={[
            styles.reactionTriggerBtn,
            styles.triggerRight,
            (isHovered || Platform.OS !== 'web') ? styles.triggerVisible : styles.triggerHidden,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Thả biểu cảm"
        >
          <Ionicons name="happy-outline" size={17} color={colors.textPlaceholder} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
  },
  jumboBubble: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    elevation: 0,
    shadowOpacity: 0,
  },
  bubbleMine: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.xs,
  },
  bubbleTheir: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderBottomLeftRadius: Radius.xs,
    borderBottomRightRadius: Radius.lg,
  },
  imageBubblePadding: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 6,
  },
  imageContainer: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: 4,
  },
  messageImage: {
    width: MAX_BUBBLE_WIDTH - 8,
    height: 180,
    borderRadius: Radius.md,
  },
  textMine: {
    lineHeight: 21,
  },
  textTheir: {
    lineHeight: 21,
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
  },
  statusTickWrapper: {
    marginLeft: 4,
  },
  reactionTriggerBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerLeft: {
    marginRight: 6,
  },
  triggerRight: {
    marginLeft: 6,
  },
  triggerVisible: {
    opacity: 1,
  },
  triggerHidden: {
    opacity: Platform.OS === 'web' ? 0 : 0.6,
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    zIndex: 2,
  },
  reactionBadgeMine: {
    right: 4,
  },
  reactionBadgeTheir: {
    left: 4,
  },
  reactionBadgeEmoji: {
    fontSize: 14,
  },
});
