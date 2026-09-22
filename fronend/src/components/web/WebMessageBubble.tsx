import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { formatMessageTime } from '../../utils/date';
import { WebChatMessageItem, WebPeerData } from './types';
import { BASE_URL } from '../../services/api';

interface WebMessageBubbleProps {
  message: WebChatMessageItem;
  isMe: boolean;
  peer: WebPeerData;
  showAvatar: boolean;
  onImagePress?: (url: string) => void;
  onReactionPress?: (message: WebChatMessageItem) => void;
}

export const WebMessageBubble: React.FC<WebMessageBubbleProps> = ({
  message,
  isMe,
  peer,
  showAvatar,
  onImagePress,
  onReactionPress,
}) => {
  const { colors, isDark } = useTheme();

  const resolveImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) {
      const serverOrigin = BASE_URL.replace('/api', '');
      return `${serverOrigin}${url}`;
    }
    return url;
  };

  const isImage = message.message_type === 'image' && !!message.image_url;
  const timeFormatted = formatMessageTime(message.created_at);

  return (
    <View
      style={[
        styles.row,
        isMe ? styles.rowMe : styles.rowPeer,
      ]}
    >
      {/* Left Avatar for Peer */}
      {!isMe && (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <Avatar
              uri={peer.avatar_url}
              name={peer.username}
              size={32}
            />
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>
      )}

      {/* Bubble Container */}
      <View
        style={[
          styles.bubbleWrapper,
          isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperPeer,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe
              ? [
                  styles.bubbleMe,
                  {
                    backgroundColor: colors.primary,
                  },
                ]
              : [
                  styles.bubblePeer,
                  {
                    backgroundColor: isDark ? '#192339' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(226, 232, 240, 0.8)',
                  },
                ],
            isImage && styles.bubbleWithImage,
          ]}
        >
          {/* If Message is an Image */}
          {isImage ? (
            <Pressable
              onPress={() => onImagePress?.(resolveImageUrl(message.image_url))}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: resolveImageUrl(message.image_url) }}
                style={styles.imageContent}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ) : (
            /* Text Message */
            <Text
              style={[
                styles.messageText,
                {
                  color: isMe
                    ? '#FFFFFF'
                    : isDark
                    ? '#F8FAFC'
                    : '#0F172A',
                },
              ]}
              selectable={true}
            >
              {message.content}
            </Text>
          )}

          {/* Timestamp & Read Receipts */}
          <View
            style={[
              styles.metaRow,
              isMe ? styles.metaRowMe : styles.metaRowPeer,
            ]}
          >
            <Text
              style={[
                styles.timeText,
                {
                  color: isMe
                    ? 'rgba(255, 255, 255, 0.75)'
                    : colors.textMuted,
                },
              ]}
            >
              {timeFormatted}
            </Text>

            {isMe && (
              <Ionicons
                name={message.is_read ? 'checkmark-done' : 'checkmark'}
                size={13}
                color={message.is_read ? '#38BDF8' : 'rgba(255, 255, 255, 0.75)'}
                style={{ marginLeft: 2 }}
              />
            )}
          </View>

          {/* Reaction Tag (if any) */}
          {message.reaction && (
            <Pressable
              onPress={() => onReactionPress?.(message)}
              style={[
                styles.reactionPill,
                {
                  backgroundColor: isDark ? '#23304B' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.9)',
                },
              ]}
            >
              <Text style={styles.reactionText}>{message.reaction}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 3,
    paddingHorizontal: 16,
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowPeer: {
    justifyContent: 'flex-start',
  },
  avatarSlot: {
    marginRight: 8,
    marginBottom: 2,
    width: 32,
    alignItems: 'center',
  },
  bubbleWrapper: {
    maxWidth: '68%',
  },
  bubbleWrapperMe: {
    alignItems: 'flex-end',
  },
  bubbleWrapperPeer: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 7,
    borderRadius: 18,
    position: 'relative',
    ...(Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as any) : {}),
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubblePeer: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleWithImage: {
    padding: 4,
    borderRadius: 14,
  },
  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  imageContent: {
    width: 260,
    height: 190,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaRowMe: {
    justifyContent: 'flex-end',
  },
  metaRowPeer: {
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
  reactionPill: {
    position: 'absolute',
    bottom: -9,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' as any,
    zIndex: 5,
  },
  reactionText: {
    fontSize: 12,
  },
});
