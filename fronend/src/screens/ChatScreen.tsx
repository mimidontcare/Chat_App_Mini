import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../constants/theme';
import {
  Avatar,
  ChatBubble,
  TypingIndicator,
  EmojiPicker,
  ReactionPicker,
} from '../components/common';
import api, { BASE_URL } from '../services/api';
import { formatMessageTime } from '../utils/date';
import { appendImageToFormData } from '../utils/fileUpload';

import {
  getSocket,
  joinChatRoom,
  leaveChatRoom,
  emitSocketMessage,
  emitTyping,
  emitStopTyping,
  emitMessageRead,
  emitMessageReaction,
} from '../services/socket';

export interface ChatMessageItem {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_type: 'text' | 'image';
  content: string;
  image_url: string | null;
  is_read: boolean;
  reaction?: string | null;
  reaction_user_id?: number | null;
  created_at: string;
}

interface ChatScreenProps {
  conversation: {
    id: number;
    peer: {
      id: number;
      username: string;
      email?: string | null;
      avatar_url?: string | null;
      is_online?: boolean;
      last_seen?: string;
    };
  };
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isPeerOnline, setIsPeerOnline] = useState<boolean>(!!conversation.peer.is_online);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<ChatMessageItem | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lắng nghe bàn phím xuất hiện trên Android / iOS để tự động cuộn tin nhắn và đo chiều cao chính xác
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Helper chuyển đổi URL ảnh tương đối sang URL đầy đủ của server
  const resolveImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) {
      const serverOrigin = BASE_URL.replace('/api', '');
      return `${serverOrigin}${url}`;
    }
    return url;
  };

  // 1. Tải lịch sử tin nhắn từ Backend
  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/conversations/${conversation.id}/messages`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử tin nhắn:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversation.id]);

  // 2. Đánh dấu đã đọc
  const markAsRead = useCallback(async () => {
    try {
      await api.put(`/conversations/${conversation.id}/read`);
      if (user?.id) {
        emitMessageRead(conversation.id, user.id, conversation.peer.id);
      }
    } catch (err) {
      // Bỏ qua lỗi đánh dấu đã đọc
    }
  }, [conversation.id, conversation.peer.id, user?.id]);

  useEffect(() => {
    fetchMessages();
    markAsRead();
  }, [fetchMessages, markAsRead]);

  // 3. Quản lý kết nối Socket.IO Realtime
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Gia nhập room chat
    joinChatRoom(conversation.id);

    // Lắng nghe tin nhắn mới tới realtime
    const handleReceiveMessage = (newMsg: ChatMessageItem) => {
      if (Number(newMsg.conversation_id) === Number(conversation.id)) {
        setMessages((prev) => {
          // Tránh duplicate tin nhắn
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // Nếu tin nhắn từ đối phương, đánh dấu đã xem ngay
        if (newMsg.sender_id === conversation.peer.id) {
          markAsRead();
        }
      }
    };

    // Lắng nghe đối phương đang gõ tin nhắn
    const handleDisplayTyping = (data: { conversation_id: number; username?: string }) => {
      if (Number(data.conversation_id) === Number(conversation.id)) {
        setIsPeerTyping(true);
      }
    };

    const handleHideTyping = (data: { conversation_id: number }) => {
      if (Number(data.conversation_id) === Number(conversation.id)) {
        setIsPeerTyping(false);
      }
    };

    // Lắng nghe khi đối phương đã xem tin nhắn của mình
    const handleMessagesMarkedRead = (data: { conversation_id: number; reader_id: number }) => {
      if (Number(data.conversation_id) === Number(conversation.id)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id === user?.id ? { ...msg, is_read: true } : msg
          )
        );
      }
    };

    // Lắng nghe trạng thái online/offline của user
    const handleUserOnline = (data: { userId: number }) => {
      if (Number(data.userId) === Number(conversation.peer.id)) {
        setIsPeerOnline(true);
      }
    };

    const handleUserOffline = (data: { userId: number }) => {
      if (Number(data.userId) === Number(conversation.peer.id)) {
        setIsPeerOnline(false);
      }
    };

    const handleReceiveReaction = (data: {
      conversation_id: number;
      message_id: number;
      reaction: string | null;
      user_id: number;
    }) => {
      if (Number(data.conversation_id) === Number(conversation.id)) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === Number(data.message_id)
              ? { ...m, reaction: data.reaction, reaction_user_id: data.user_id }
              : m
          )
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('display_typing', handleDisplayTyping);
    socket.on('hide_typing', handleHideTyping);
    socket.on('messages_marked_read', handleMessagesMarkedRead);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('receive_reaction', handleReceiveReaction);

    // Kiểm tra trạng thái online hiện tại qua socket
    socket.emit('check_user_online', { userId: conversation.peer.id }, (res: any) => {
      if (res && typeof res.isOnline === 'boolean') {
        setIsPeerOnline(res.isOnline);
      }
    });

    return () => {
      leaveChatRoom(conversation.id);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('display_typing', handleDisplayTyping);
      socket.off('hide_typing', handleHideTyping);
      socket.off('messages_marked_read', handleMessagesMarkedRead);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('receive_reaction', handleReceiveReaction);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation.id, conversation.peer.id, markAsRead, user?.id]);

  // 4. Xử lý gõ chữ (Typing indicator emitter)
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (text.trim().length > 0) {
      emitTyping(conversation.id, conversation.peer.id, user?.username);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(conversation.id, conversation.peer.id);
      }, 2000);
    } else {
      emitStopTyping(conversation.id, conversation.peer.id);
    }
  };

  // 5. Gửi tin nhắn Text / Emoji
  const sendTextMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    if (textToSend === inputText) {
      setInputText('');
    }
    setShowEmojiPicker(false);
    emitStopTyping(conversation.id, conversation.peer.id);

    // Optimistic UI: hiển thị tin nhắn ngay
    const tempId = Date.now();
    const optimisticMsg: ChatMessageItem = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: user?.id || 0,
      message_type: 'text',
      content: trimmed,
      image_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setIsSending(true);
      const res = await api.post('/messages', {
        conversation_id: conversation.id,
        content: trimmed,
        message_type: 'text',
      });

      if (res.data?.success && res.data?.data) {
        const savedMsg = res.data.data;
        // Cập nhật ID thật từ server
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? savedMsg : m))
        );

        // Bắn Socket Realtime cho đối phương
        emitSocketMessage(conversation.id, conversation.peer.id, savedMsg);
      }
    } catch (err: any) {
      console.error('Lỗi gửi tin nhắn:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleSendText = () => sendTextMessage(inputText);
  const handleSendQuickLike = () => sendTextMessage('👍');

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleReactionPress = (msg: ChatMessageItem) => {
    setSelectedMessageForReaction(msg);
  };

  const handleSelectReaction = async (reactionEmoji: string) => {
    if (!selectedMessageForReaction || !user) return;
    const targetMsg = selectedMessageForReaction;
    const targetMsgId = targetMsg.id;

    // Toggle: nếu bấm lại đúng reaction cũ của chính mình thì gỡ bỏ (null)
    const newReaction =
      targetMsg.reaction === reactionEmoji && targetMsg.reaction_user_id === user.id
        ? null
        : reactionEmoji;

    // Optimistic Update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === targetMsgId
          ? {
              ...m,
              reaction: newReaction,
              reaction_user_id: newReaction ? user.id : null,
            }
          : m
      )
    );

    // Bắn realtime socket
    emitMessageReaction(
      conversation.id,
      conversation.peer.id,
      targetMsgId,
      newReaction,
      user.id
    );

    // Lưu cơ sở dữ liệu
    try {
      await api.post(`/messages/${targetMsgId}/reaction`, { reaction: newReaction });
    } catch (err) {
      console.error('Lỗi lưu reaction:', err);
    }
  };

  // Xử lý phím Enter trên bàn phím: Enter để gửi tin nhắn, Shift + Enter để xuống dòng (hỗ trợ tốt trên Web & Desktop)
  const handleKeyPress = (e: any) => {
    if (Platform.OS === 'web') {
      const isComposing = e.nativeEvent?.isComposing || e.nativeEvent?.keyCode === 229;
      if (e.nativeEvent?.key === 'Enter' && !e.nativeEvent?.shiftKey && !isComposing) {
        if (e.preventDefault) e.preventDefault();
        if (e.nativeEvent?.preventDefault) e.nativeEvent.preventDefault();
        handleSendText();
      }
    }
  };

  // 4. Chọn và gửi ảnh (Phase 7 & 10)
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Cần cấp quyền truy cập thư viện ảnh để gửi hình ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const asset = result.assets[0];
        const imageUri = asset.uri;

        // Optimistic UI
        const tempId = Date.now();
        const optimisticMsg: ChatMessageItem = {
          id: tempId,
          conversation_id: conversation.id,
          sender_id: user?.id || 0,
          message_type: 'image',
          content: '',
          image_url: imageUri,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);

        try {
          // Upload lên Backend
          const formData = new FormData();
          formData.append('conversation_id', conversation.id.toString());
          await appendImageToFormData(formData, 'image', {
            uri: imageUri,
            name: asset.fileName,
            type: asset.mimeType,
            file: (asset as any).file,
          });

          const uploadRes = await api.post('/messages/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadRes.data?.success && uploadRes.data?.data) {
            const savedImgMsg = uploadRes.data.data;
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? savedImgMsg : m))
            );

            // Bắn Socket Realtime gửi ảnh tới đối phương
            emitSocketMessage(conversation.id, conversation.peer.id, savedImgMsg);
          }
        } catch (uploadErr: any) {
          // Xóa tin nhắn tạm nếu gửi thất bại
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          console.error('Lỗi khi tải ảnh lên server:', uploadErr);
          Alert.alert('Lỗi gửi ảnh', uploadErr.message || 'Không thể gửi ảnh lúc này.');
        }
      }
    } catch (e: any) {
      console.error('Lỗi chọn ảnh:', e);
      Alert.alert('Lỗi', e.message || 'Không thể mở thư viện ảnh.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={styles.flexContainer}
      >
        {/* Chat Top Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }, Shadows.sm]}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: pressed ? colors.surfaceHover : 'transparent' },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Trở về danh sách đoạn chat"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.headerProfile}>
            <Avatar
              uri={conversation.peer.avatar_url}
              name={conversation.peer.username}
              size="sm"
              isOnline={isPeerOnline}
              hasRing={isPeerOnline}
              showStatus
            />
            <View style={styles.headerInfo}>
              <Text style={[Typography.title, styles.headerName, { color: colors.textPrimary }]} numberOfLines={1}>
                {conversation.peer.username}
              </Text>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: isPeerTyping
                      ? colors.primary
                      : isPeerOnline
                      ? colors.online
                      : colors.textSecondary,
                    fontWeight: isPeerTyping || isPeerOnline ? '600' : '400',
                  },
                ]}
              >
                {isPeerTyping
                  ? 'Đang nhập...'
                  : isPeerOnline
                  ? 'Đang hoạt động'
                  : 'Không hoạt động'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => Alert.alert('Thông báo', 'Tính năng gọi thoại đang được phát triển.')}
              style={({ pressed }) => [
                styles.headerActionBtn,
                { backgroundColor: pressed ? colors.surfaceHover : colors.surfaceSecondary },
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Gọi thoại"
            >
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </Pressable>

            <Pressable
              onPress={() => Alert.alert('Thông báo', 'Tính năng gọi video đang được phát triển.')}
              style={({ pressed }) => [
                styles.headerActionBtn,
                { backgroundColor: pressed ? colors.surfaceHover : colors.surfaceSecondary },
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Gọi video"
            >
              <Ionicons name="videocam-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Messages Stream */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>
              Đang tải tin nhắn...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <ChatBubble
                message={{
                  ...item,
                  image_url: resolveImageUrl(item.image_url) || undefined,
                  created_at: formatMessageTime(item.created_at),
                } as any}
                isMine={item.sender_id === user?.id}
                onImagePress={(url) => setPreviewImageUrl(url)}
                onReactionPress={handleReactionPress}
              />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onScrollBeginDrag={() => setShowEmojiPicker(false)}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <View style={[styles.emptyChatCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.primary} />
                </View>
                <Text style={[Typography.title, { color: colors.textPrimary, textAlign: 'center', marginTop: 12 }]}>
                  Bắt đầu cuộc trò chuyện
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
                  Hãy gửi lời chào đầu tiên tới {conversation.peer.username}!
                </Text>
              </View>
            }
            ListFooterComponent={
              isPeerTyping ? <TypingIndicator username={conversation.peer.username} /> : null
            }
          />
        )}

        {/* Bottom Input Composer */}
        <View
          style={[
            styles.composerBar,
            {
              backgroundColor: isDark ? colors.surface : colors.floatingDock,
              borderTopColor: colors.borderLight,
              paddingBottom: keyboardHeight > 0 ? Spacing.sm + 2 : Math.max(Spacing.sm, insets.bottom),
              marginBottom: Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight + 10 : 0,
            },
          ]}
        >
          {/* Nút [+] thêm ảnh */}
          <Pressable
            onPress={handlePickImage}
            style={({ pressed }) => [
              styles.attachBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Thêm hình ảnh hoặc đính kèm"
          >
            <Ionicons name="add-circle" size={30} color={colors.primary} />
          </Pressable>

          {/* Ô nhập nội dung tin nhắn kèm nút Emoji */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[
                Typography.body,
                styles.textInput,
                { color: colors.textPrimary },
                Platform.OS === 'web'
                  ? ({
                      outlineStyle: 'none',
                      outlineWidth: 0,
                      outlineColor: 'transparent',
                      boxShadow: 'none',
                    } as any)
                  : null,
              ]}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={colors.textPlaceholder}
              value={inputText}
              onChangeText={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowEmojiPicker(false)}
              onSubmitEditing={Platform.OS !== 'web' ? handleSendText : undefined}
              blurOnSubmit={false}
              returnKeyType="send"
              enterKeyHint="send"
              multiline
              maxLength={1000}
            />

            {/* Nút bật/tắt Emoji Picker */}
            <Pressable
              onPress={() => {
                if (!showEmojiPicker) {
                  Keyboard.dismiss();
                }
                setShowEmojiPicker((prev) => !prev);
              }}
              style={styles.emojiToggleBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Chọn biểu tượng cảm xúc"
            >
              <Ionicons
                name={showEmojiPicker ? 'happy' : 'happy-outline'}
                size={22}
                color={showEmojiPicker ? colors.primary : colors.textPlaceholder}
              />
            </Pressable>
          </View>

          {/* Nút Gửi / Quick Like 👍 */}
          {inputText.trim().length > 0 ? (
            <Pressable
              onPress={handleSendText}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: colors.primary,
                },
                Shadows.glow,
                Platform.OS === 'web'
                  ? ({
                      backgroundImage: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                    } as any)
                  : null,
              ]}
              disabled={isSending}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="send"
                  size={17}
                  color={colors.onPrimary}
                />
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSendQuickLike}
              style={styles.quickLikeBtn}
              disabled={isSending}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Thả Like nhanh"
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#0084FF" />
              ) : (
                <Text style={styles.quickLikeIcon}>👍</Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Emoji Picker Board */}
        {showEmojiPicker && (
          <EmojiPicker
            visible={showEmojiPicker}
            onSelectEmoji={handleSelectEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </KeyboardAvoidingView>

      {/* Reaction Picker Popup */}
      <ReactionPicker
        visible={!!selectedMessageForReaction}
        currentReaction={selectedMessageForReaction?.reaction}
        onSelectReaction={handleSelectReaction}
        onClose={() => setSelectedMessageForReaction(null)}
      />

      {/* Fullscreen Image Lightbox Modal */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.lightboxContainer}>
          <Pressable
            onPress={() => setPreviewImageUrl(null)}
            style={styles.lightboxCloseBtn}
            hitSlop={12}
          >
            <Ionicons name="close-circle" size={36} color="#FFFFFF" />
          </Pressable>

          {previewImageUrl ? (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.lightboxImage}
              contentFit="contain"
            />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  headerInfo: {
    marginLeft: Spacing.sm + 2,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    padding: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyChatCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  attachBtn: {
    padding: Spacing.sm,
    marginBottom: 4,
  },
  inputContainer: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    paddingRight: 6,
    paddingVertical: 6,
    marginHorizontal: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    maxHeight: 90,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outlineColor: 'transparent',
          boxShadow: 'none',
        } as any)
      : {}),
  },
  emojiToggleBtn: {
    padding: 4,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickLikeBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickLikeIcon: {
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  lightboxImage: {
    width: '94%',
    height: '80%',
  },
});
