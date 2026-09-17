import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../../constants/theme';
import { MockMessage } from '../../constants/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.74;

export interface ChatBubbleProps {
  message: MockMessage;
  isMine: boolean;
  onImagePress?: (url: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isMine,
  onImagePress,
}) => {
  const { colors } = useTheme();

  const isImage = message.message_type === 'image' && !!message.image_url;

  return (
    <View
      style={[
        styles.row,
        isMine ? styles.rowMine : styles.rowTheir,
      ]}
    >
      <View
        style={[
          styles.bubbleBase,
          isMine
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
            accessibilityLabel="View full photo"
          >
            <Image
              source={{ uri: message.image_url }}
              style={styles.messageImage}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        ) : null}

        {/* Message Text Content */}
        {message.content && !isImage ? (
          <Text
            style={[
              Typography.body,
              isMine ? styles.textMine : styles.textTheir,
              { color: isMine ? colors.outgoingBubbleText : colors.incomingBubbleText },
            ]}
          >
            {message.content}
          </Text>
        ) : null}

        {/* Timestamp & Status Metadata */}
        <View style={styles.metaRow}>
          <Text
            style={[
              Typography.caption,
              {
                color: isMine
                  ? 'rgba(255, 255, 255, 0.75)'
                  : colors.textSecondary,
              },
            ]}
          >
            {message.created_at}
          </Text>

          {isMine && (
            <View style={styles.statusTickWrapper}>
              {message.is_read ? (
                <Ionicons name="checkmark-done" size={15} color={colors.readTick} />
              ) : (
                <Ionicons name="checkmark" size={15} color="rgba(255, 255, 255, 0.75)" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheir: {
    justifyContent: 'flex-start',
  },
  bubbleBase: {
    maxWidth: MAX_BUBBLE_WIDTH,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  statusTickWrapper: {
    marginLeft: 4,
  },
});
