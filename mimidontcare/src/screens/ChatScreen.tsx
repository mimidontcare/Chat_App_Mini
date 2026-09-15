import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { Typography, Radius, Spacing } from '../constants/theme';
import { Avatar, ChatBubble, TypingIndicator } from '../components/common';
import {
  CURRENT_USER,
  MockConversation,
  MockMessage,
  MOCK_MESSAGES_CONV_101,
} from '../constants/mockData';

interface ChatScreenProps {
  conversation: MockConversation;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversation, onBack }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES_CONV_101);
  const [inputText, setInputText] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const handleSendText = () => {
    if (!inputText.trim()) return;

    const newMessage: MockMessage = {
      id: Date.now(),
      conversation_id: conversation.id,
      sender_id: CURRENT_USER.id,
      message_type: 'text',
      content: inputText.trim(),
      is_read: false,
      created_at: 'Just now',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulate peer replying with typing animation after 1.2s
    setTimeout(() => {
      setIsPeerTyping(true);
      setTimeout(() => {
        setIsPeerTyping(false);
        const replyMessage: MockMessage = {
          id: Date.now() + 1,
          conversation_id: conversation.id,
          sender_id: conversation.peer.id,
          message_type: 'text',
          content: 'Got it! Thanks for the update 👍',
          is_read: true,
          created_at: 'Just now',
        };
        setMessages((prev) => [...prev, replyMessage]);
      }, 2500);
    }, 1200);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access photos is required to send images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const imageUri = result.assets[0].uri;
        const newImageMsg: MockMessage = {
          id: Date.now(),
          conversation_id: conversation.id,
          sender_id: CURRENT_USER.id,
          message_type: 'image',
          content: '',
          image_url: imageUri,
          is_read: false,
          created_at: 'Just now',
        };
        setMessages((prev) => [...prev, newImageMsg]);
      }
    } catch (e) {
      console.log('Image picker error:', e);
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
          accessibilityLabel="Back to chats"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.headerProfile}>
          <Avatar
            uri={conversation.peer.avatar_url}
            name={conversation.peer.username}
            size="sm"
            isOnline={conversation.peer.is_online}
            showStatus
          />
          <View style={styles.headerInfo}>
            <Text style={[Typography.title, styles.headerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {conversation.peer.username}
            </Text>
            <Text style={[Typography.caption, { color: conversation.peer.is_online ? colors.online : colors.textSecondary }]}>
              {conversation.peer.is_online ? 'Active now' : conversation.peer.last_seen || 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setIsPeerTyping(!isPeerTyping)}
            style={styles.headerActionBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Toggle simulated typing indicator"
          >
            <Ionicons
              name={isPeerTyping ? 'flash' : 'flash-outline'}
              size={20}
              color={isPeerTyping ? colors.warning : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Messages Stream */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={styles.flexContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isMine={item.sender_id === CURRENT_USER.id}
              onImagePress={(url) => setPreviewImageUrl(url)}
            />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isPeerTyping ? <TypingIndicator username={conversation.peer.username} /> : null
          }
        />

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
          <Pressable
            onPress={handlePickImage}
            style={styles.attachBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Pick photo"
          >
            <Ionicons name="image-outline" size={24} color={colors.primary} />
          </Pressable>

          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[Typography.body, styles.textInput, { color: colors.textPrimary }]}
              placeholder="Write a message..."
              placeholderTextColor={colors.textPlaceholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>

          <Pressable
            onPress={handleSendText}
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim().length > 0 ? colors.primary : colors.surfaceSecondary,
              },
            ]}
            disabled={!inputText.trim()}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim().length > 0 ? colors.onPrimary : colors.textMuted}
            />
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
  messagesList: {
    paddingVertical: Spacing.md,
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
