import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { WebChatHeader } from './WebChatHeader';
import { WebMessageList } from './WebMessageList';
import { WebMessageInput } from './WebMessageInput';
import { WebConversationItemData, WebChatMessageItem } from './types';
import api from '../../services/api';
import { appendImageToFormData } from '../../utils/fileUpload';
import {
  getSocket,
  joinChatRoom,
  leaveChatRoom,
  emitSocketMessage,
  emitTyping,
  emitStopTyping,
  emitMessageRead,
  emitMessageReaction,
} from '../../services/socket';

interface WebChatAreaProps {
  conversation: WebConversationItemData;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onConversationUpdated?: (updatedConv: any) => void;
}

export const WebChatArea: React.FC<WebChatAreaProps> = ({
  conversation,
  showBackButton = false,
  onBackPress,
  onConversationUpdated,
}) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  const [messages, setMessages] = useState<WebChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isPeerOnline, setIsPeerOnline] = useState<boolean>(!!conversation.peer?.is_online);

  // Message Request handling for stranger conversations
  const isIncomingRequest =
    (conversation.status === 'message_request' || conversation.is_request === true) &&
    conversation.request_sender_id !== user?.id;

  const [isRequestActive, setIsRequestActive] = useState(isIncomingRequest);
  const [isHandlingRequest, setIsHandlingRequest] = useState(false);

  useEffect(() => {
    setIsRequestActive(
      (conversation.status === 'message_request' || conversation.is_request === true) &&
      conversation.request_sender_id !== user?.id
    );
  }, [conversation.id, conversation.status, conversation.is_request, conversation.request_sender_id, user?.id]);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onConversationUpdatedRef = useRef(onConversationUpdated);
  useEffect(() => {
    onConversationUpdatedRef.current = onConversationUpdated;
  });

  const handleAcceptRequest = async () => {
    try {
      setIsHandlingRequest(true);
      const res = await api.post(`/conversations/request/${conversation.id}/accept`);
      if (res.data?.success) {
        setIsRequestActive(false);
        onConversationUpdatedRef.current?.({
          ...conversation,
          status: 'normal',
          is_request: false,
        });
      }
    } catch (err: any) {
      console.error('Lỗi chấp nhận tin nhắn chờ:', err);
    } finally {
      setIsHandlingRequest(false);
    }
  };

  const handleRejectRequest = async () => {
    try {
      setIsHandlingRequest(true);
      const res = await api.post(`/conversations/request/${conversation.id}/reject`);
      if (res.data?.success) {
        setIsRequestActive(false);
        onBackPress?.();
      }
    } catch (err: any) {
      console.error('Lỗi từ chối tin nhắn chờ:', err);
    } finally {
      setIsHandlingRequest(false);
    }
  };

  // 1. Tải lịch sử tin nhắn
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/conversations/${conversation.id}/messages`);
      if (res.data?.success && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversation.id]);

  // 2. Đánh dấu đã đọc
  const markAsRead = useCallback(async () => {
    try {
      await api.put(`/conversations/${conversation.id}/read`);
      if (user?.id && conversation.peer?.id) {
        emitMessageRead(conversation.id, user.id, conversation.peer.id);
      }
      if (conversation.unread_count && conversation.unread_count > 0) {
        onConversationUpdatedRef.current?.({ ...conversation, unread_count: 0 });
      }
    } catch {
      // bỏ qua
    }
  }, [conversation.id, conversation.peer?.id, conversation.unread_count, user?.id]);

  useEffect(() => {
    fetchMessages();
    markAsRead();
  }, [conversation.id]);

  // 3. Socket Realtime events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    joinChatRoom(conversation.id);

    const handleReceiveMessage = (newMsg: WebChatMessageItem) => {
      if (Number(newMsg.conversation_id) === Number(conversation.id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        if (newMsg.sender_id === conversation.peer.id) {
          markAsRead();
        }
      }
    };

    const handleDisplayTyping = (data: { conversation_id: number }) => {
      if (Number(data.conversation_id) === Number(conversation.id)) {
        setIsPeerTyping(true);
      }
    };

    const handleHideTyping = (data: { conversation_id: number }) => {
      if (Number(data.conversation_id) === Number(conversation.id)) {
        setIsPeerTyping(false);
      }
    };

    const handleMessagesMarkedRead = (data: { conversation_id: number; reader_id: number }) => {
      if (Number(data.conversation_id) === Number(conversation.id)) {
        setMessages((prev) =>
          prev.map((msg) =>
            Number(msg.sender_id) === Number(user?.id) ? { ...msg, is_read: true } : msg
          )
        );
      }
    };

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

  // 4. Typing emitter
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

  // 5. Send text message
  const sendTextMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    if (textToSend === inputText) {
      setInputText('');
    }
    emitStopTyping(conversation.id, conversation.peer.id);

    // Optimistic message
    const tempId = Date.now();
    const optimisticMsg: WebChatMessageItem = {
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
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? savedMsg : m))
        );
        emitSocketMessage(conversation.id, conversation.peer.id, savedMsg);
        onConversationUpdated?.({
          ...conversation,
          last_message: savedMsg,
          updated_at: savedMsg.created_at,
        });
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn trên Web:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  // 6. Pick and send image
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const asset = result.assets[0];
        const imageUri = asset.uri;

        const tempId = Date.now();
        const optimisticMsg: WebChatMessageItem = {
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
            emitSocketMessage(conversation.id, conversation.peer.id, savedImgMsg);
            onConversationUpdated?.({
              ...conversation,
              last_message: savedImgMsg,
              updated_at: savedImgMsg.created_at,
            });
          }
        } catch (uploadErr) {
          console.error('Lỗi tải ảnh lên server:', uploadErr);
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
      }
    } catch (err) {
      console.error('Lỗi mở thư viện ảnh:', err);
    }
  };

  // 7. Reaction handler
  const handleSelectReaction = async (messageId: number, reactionEmoji: string) => {
    if (!user) return;
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    const newReaction =
      targetMsg.reaction === reactionEmoji && targetMsg.reaction_user_id === user.id
        ? null
        : reactionEmoji;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              reaction: newReaction,
              reaction_user_id: newReaction ? user.id : null,
            }
          : m
      )
    );

    emitMessageReaction(
      conversation.id,
      conversation.peer.id,
      messageId,
      newReaction,
      user.id
    );

    try {
      await api.post(`/messages/${messageId}/reaction`, { reaction: newReaction });
    } catch (err) {
      console.error('Lỗi cập nhật reaction:', err);
    }
  };

  const peerWithStatus = {
    ...conversation.peer,
    is_online: isPeerOnline,
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#080C14' : '#F8FAFC',
        },
      ]}
    >
      <WebChatHeader
        peer={peerWithStatus}
        showBackButton={showBackButton}
        onBackPress={onBackPress}
      />

      {isRequestActive && (
        <View
          style={[
            styles.requestBanner,
            {
              backgroundColor: isDark ? '#1C2333' : '#FFFBEB',
              borderBottomColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A',
            },
          ]}
        >
          <View style={styles.requestBannerInfo}>
            <Ionicons name="alert-circle" size={22} color="#F59E0B" />
            <View style={styles.requestBannerTextWrap}>
              <Text
                style={[
                  styles.requestBannerTitle,
                  { color: isDark ? '#FCD34D' : '#92400E' },
                ]}
              >
                Tin nhắn chờ từ người lạ
              </Text>
              <Text
                style={[
                  styles.requestBannerSubtitle,
                  { color: isDark ? '#94A3B8' : '#78350F' },
                ]}
              >
                {conversation.peer?.username || 'Người dùng'} muốn kết nối và trò chuyện với bạn.
              </Text>
            </View>
          </View>

          <View style={styles.requestBannerActions}>
            <Pressable
              style={[
                styles.requestBtn,
                styles.rejectBtn,
                { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' },
                isHandlingRequest && { opacity: 0.6 },
              ]}
              onPress={handleRejectRequest}
              disabled={isHandlingRequest}
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={[styles.rejectBtnText, { color: '#EF4444' }]}>Từ chối</Text>
            </Pressable>

            <Pressable
              style={[
                styles.requestBtn,
                styles.acceptBtn,
                { backgroundColor: '#0084FF' },
                isHandlingRequest && { opacity: 0.6 },
              ]}
              onPress={handleAcceptRequest}
              disabled={isHandlingRequest}
            >
              {isHandlingRequest ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptBtnText}>Chấp nhận</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}

      <WebMessageList
        messages={messages}
        peer={peerWithStatus}
        currentUserId={user?.id || 0}
        isLoading={isLoading}
        isPeerTyping={isPeerTyping}
        onSelectReaction={handleSelectReaction}
      />

      <WebMessageInput
        inputText={inputText}
        onInputChange={handleInputChange}
        onSendText={() => sendTextMessage(inputText)}
        onSendQuickLike={() => sendTextMessage('👍')}
        onPickImage={handlePickImage}
        onSelectEmoji={(emoji) => setInputText((prev) => prev + emoji)}
        isSending={isSending}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
    flexWrap: 'wrap',
  },
  requestBannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 240,
  },
  requestBannerTextWrap: {
    flex: 1,
  },
  requestBannerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  requestBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  requestBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  acceptBtn: {
    shadowColor: '#0084FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
