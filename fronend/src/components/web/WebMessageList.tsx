import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { WebMessageBubble } from './WebMessageBubble';
import { Avatar } from '../common/Avatar';
import { ReactionPicker } from '../common/ReactionPicker';
import { WebChatMessageItem, WebPeerData } from './types';

interface WebMessageListProps {
  messages: WebChatMessageItem[];
  peer: WebPeerData;
  currentUserId: number;
  isLoading: boolean;
  isPeerTyping: boolean;
  onSelectReaction: (messageId: number, reaction: string) => void;
}

export const WebMessageList: React.FC<WebMessageListProps> = ({
  messages,
  peer,
  currentUserId,
  isLoading,
  isPeerTyping,
  onSelectReaction,
}) => {
  const { colors, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [reactionTargetMessage, setReactionTargetMessage] = useState<WebChatMessageItem | null>(null);

  // Auto scroll to bottom when messages update or typing state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [messages.length, isPeerTyping]);

  // Helper to format Date Separator
  const getDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) return 'Hôm nay';

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      if (isYesterday) return 'Hôm qua';

      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải lịch sử tin nhắn...
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {messages.length === 0 ? (
            <View style={styles.startConversationBox}>
              <Avatar
                uri={peer?.avatar_url}
                name={peer?.username || 'User'}
                size={64}
                isOnline={peer?.is_online}
              />
              <Text style={[styles.startPeerName, { color: colors.textPrimary }]}>
                {peer?.username || 'Người dùng'}
              </Text>
              <Text style={[styles.startPeerDesc, { color: colors.textSecondary }]}>
                Bắt đầu trò chuyện với {peer?.username || 'người này'}. Tin nhắn của bạn được bảo mật.
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isMe = Number(msg.sender_id) === Number(currentUserId);
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

              // Check if date changed
              const currentDateLabel = getDateLabel(msg.created_at);
              const prevDateLabel = prevMsg ? getDateLabel(prevMsg.created_at) : '';
              const showDateSeparator = !prevMsg || currentDateLabel !== prevDateLabel;

              // Show avatar only on the last consecutive message from peer
              const showAvatar =
                !isMe &&
                (!nextMsg ||
                  Number(nextMsg.sender_id) !== Number(msg.sender_id) ||
                  getDateLabel(nextMsg.created_at) !== currentDateLabel);

              return (
                <React.Fragment key={msg.id || index}>
                  {showDateSeparator && currentDateLabel && (
                    <View style={styles.dateSeparatorRow}>
                      <View
                        style={[
                          styles.dateSeparatorPill,
                          {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(226, 232, 240, 0.9)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dateSeparatorText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {currentDateLabel}
                        </Text>
                      </View>
                    </View>
                  )}

                  <WebMessageBubble
                    message={msg}
                    isMe={isMe}
                    peer={peer}
                    showAvatar={showAvatar}
                    onImagePress={(url) => setLightboxImageUrl(url)}
                    onReactionPress={(m) => setReactionTargetMessage(m)}
                  />
                </React.Fragment>
              );
            })
          )}

          {/* Typing Indicator */}
          {isPeerTyping && (
            <View style={styles.typingRow}>
              <Avatar
                uri={peer?.avatar_url}
                name={peer?.username || 'User'}
                size={28}
              />
              <View
                style={[
                  styles.typingBubble,
                  {
                    backgroundColor: isDark ? '#192339' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(226, 232, 240, 0.8)',
                  },
                ]}
              >
                <View style={styles.dotCluster}>
                  <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
                </View>
                <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                  {peer.username} đang nhập...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Lightbox / Zoom Image Modal */}
      {lightboxImageUrl && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLightboxImageUrl(null)}
        >
          <Pressable
            style={styles.lightboxBackdrop}
            onPress={() => setLightboxImageUrl(null)}
          >
            <Pressable
              onPress={() => setLightboxImageUrl(null)}
              style={styles.lightboxCloseBtn}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </Pressable>
            <Image
              source={{ uri: lightboxImageUrl }}
              style={styles.lightboxImage}
              contentFit="contain"
            />
          </Pressable>
        </Modal>
      )}

      {/* Reaction Picker Popover */}
      {reactionTargetMessage && (
        <ReactionPicker
          visible={true}
          currentReaction={reactionTargetMessage.reaction}
          onSelectReaction={(emoji) => {
            onSelectReaction(reactionTargetMessage.id, emoji);
            setReactionTargetMessage(null);
          }}
          onClose={() => setReactionTargetMessage(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 14,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  startConversationBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    gap: 10,
  },
  startPeerName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  startPeerDesc: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 19,
  },
  dateSeparatorRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  dateSeparatorPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateSeparatorText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 6,
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  dotCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 9999,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  lightboxImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
});
