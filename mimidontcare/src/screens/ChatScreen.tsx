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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing } from '../constants/theme';
import { Avatar, ChatBubble, TypingIndicator } from '../components/common';
import api, { BASE_URL } from '../services/api';
import { formatMessageTime } from '../utils/date';

import {
  getSocket,
  joinChatRoom,
  leaveChatRoom,
  emitSocketMessage,
  emitTyping,
  emitStopTyping,
  emitMessageRead,
} from '../services/socket';

export interface ChatMessageItem {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_type: 'text' | 'image';
  content: string;
  image_url: string | null;
  is_read: boolean;
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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isPeerOnline, setIsPeerOnline] = useState<boolean>(!!conversation.peer.is_online);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    socket.on('receive_message', handleReceiveMessage);
    socket.on('display_typing', handleDisplayTyping);
    socket.on('hide_typing', handleHideTyping);
    socket.on('messages_marked_read', handleMessagesMarkedRead);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

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

  // 5. Gửi tin nhắn Text
  const handleSendText = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    setInputText('');
    emitStopTyping(conversation.id, conversation.peer.id);

    // Optimistic UI: hiển thị tin nhắn ngay
    const tempId = Date.now();
    const optimisticMsg: ChatMessageItem = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: user?.id || 0,
      message_type: 'text',
      content: textToSend,
      image_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setIsSending(true);
      const res = await api.post('/messages', {
        conversation_id: conversation.id,
        content: textToSend,
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
    } finally {
      setIsSending(false);
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
        const imageUri = result.assets[0].uri;

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

        // Upload lên Backend
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'chat_img.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('conversation_id', conversation.id.toString());
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);

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
      }
    } catch (e) {
      console.error('Lỗi chọn/gửi ảnh:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Chat Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Trở về danh sách đoạn chat"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.headerProfile}>
          <Avatar
            uri={conversation.peer.avatar_url}
            name={conversation.peer.username}
            size="sm"
            isOnline={isPeerOnline}
            showStatus
          />
          <View style={styles.headerInfo}>
            <Text style={[Typography.title, styles.headerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {conversation.peer.username}
            </Text>
            <Text style={[Typography.caption, { color: isPeerOnline ? colors.online : colors.textSecondary }]}>
              {isPeerOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => fetchMessages()}
            style={styles.headerActionBtn}
            hitSlop={8}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Messages Stream */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={styles.flexContainer}
      >
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
            renderItem={({ item }) => (
              <ChatBubble
                message={{
                  ...item,
                  image_url: resolveImageUrl(item.image_url) || undefined,
                  created_at: formatMessageTime(item.created_at),
                } as any}
                isMine={item.sender_id === user?.id}
                onImagePress={(url) => setPreviewImageUrl(url)}
              />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
                  Chưa có tin nhắn nào trong cuộc trò chuyện này.{'\n'}Hãy gửi lời chào đầu tiên! 👋
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
              backgroundColor: colors.surface,
              borderTopColor: colors.borderLight,
              paddingBottom: Math.max(Spacing.sm, insets.bottom),
            },
          ]}
        >
          {/* Nút gửi ảnh */}
          <Pressable
            onPress={handlePickImage}
            style={styles.attachBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Chọn hình ảnh"
          >
            <Ionicons name="image-outline" size={24} color={colors.primary} />
          </Pressable>

          {/* Ô nhập nội dung tin nhắn */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[Typography.body, styles.textInput, { color: colors.textPrimary }]}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={colors.textPlaceholder}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
            />
          </View>

          {/* Nút gửi tin nhắn */}
          <Pressable
            onPress={handleSendText}
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim().length > 0 ? colors.primary : colors.surfaceSecondary,
              },
            ]}
            disabled={!inputText.trim() || isSending}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Gửi tin nhắn"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim().length > 0 ? colors.onPrimary : colors.textMuted}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

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
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginHorizontal: Spacing.xs,
  },
  textInput: {
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
