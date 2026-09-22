import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { EmojiPicker } from '../common/EmojiPicker';

interface WebMessageInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSendText: () => void;
  onSendQuickLike: () => void;
  onPickImage: () => void;
  onSelectEmoji: (emoji: string) => void;
  isSending: boolean;
}

export const WebMessageInput: React.FC<WebMessageInputProps> = ({
  inputText,
  onInputChange,
  onSendText,
  onSendQuickLike,
  onPickImage,
  onSelectEmoji,
  isSending,
}) => {
  const { colors, isDark } = useTheme();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const hasText = inputText.trim().length > 0;

  // Handle Enter to send, Shift + Enter for new line on Web
  const handleKeyDown = (e: any) => {
    if (Platform.OS === 'web') {
      const isComposing = e.nativeEvent?.isComposing || e.nativeEvent?.keyCode === 229;
      if (e.nativeEvent?.key === 'Enter' && !e.nativeEvent?.shiftKey && !isComposing) {
        if (e.preventDefault) e.preventDefault();
        if (e.nativeEvent?.preventDefault) e.nativeEvent.preventDefault();
        if (hasText && !isSending) {
          onSendText();
        }
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0F1626' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(226, 232, 240, 0.9)',
        },
      ]}
    >
      {/* Left Attachment Button (Images) */}
      <Pressable
        onPress={onPickImage}
        style={({ hovered }: any) => [
          styles.iconBtn,
          hovered && {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
          },
        ]}
        accessibilityLabel="Đính kèm hình ảnh"
      >
        <Ionicons name="image-outline" size={21} color={colors.textSecondary} />
      </Pressable>

      {/* Input Field Box */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? '#141D30' : '#F1F5F9',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={inputText}
          onChangeText={onInputChange}
          onKeyPress={handleKeyDown}
          placeholder="Nhập tin nhắn (Enter để gửi, Shift + Enter xuống dòng)..."
          placeholderTextColor={colors.textMuted}
          multiline={true}
          style={[styles.textInput, { color: colors.textPrimary }]}
        />

        {/* Emoji Button inside Input */}
        <Pressable
          onPress={() => setShowEmojiPicker(true)}
          style={({ hovered }: any) => [
            styles.emojiBtn,
            hovered && { transform: [{ scale: 1.1 }] },
          ]}
          accessibilityLabel="Chọn biểu tượng cảm xúc"
        >
          <Ionicons name="happy-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Right: Send Button or Quick Like */}
      {isSending ? (
        <View style={styles.sendBtn}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : hasText ? (
        <Pressable
          onPress={onSendText}
          style={({ hovered }: any) => [
            styles.sendBtn,
            styles.sendBtnActive,
            { backgroundColor: colors.primary },
            hovered && { transform: [{ scale: 1.05 }] },
          ]}
          accessibilityLabel="Gửi tin nhắn"
        >
          <Ionicons name="send" size={17} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </Pressable>
      ) : (
        <Pressable
          onPress={onSendQuickLike}
          style={({ hovered }: any) => [
            styles.sendBtn,
            hovered && {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
            },
          ]}
          accessibilityLabel="Thích nhanh"
        >
          <Ionicons name="thumbs-up" size={20} color={colors.primary} />
        </Pressable>
      )}

      {/* Emoji Picker Modal */}
      <EmojiPicker
        visible={showEmojiPicker}
        onSelectEmoji={(emoji) => {
          onSelectEmoji(emoji);
          setShowEmojiPicker(false);
        }}
        onClose={() => setShowEmojiPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    zIndex: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        } as any)
      : {}),
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 40,
    maxHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 6,
    paddingBottom: 6,
    maxHeight: 96,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  emojiBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        } as any)
      : {}),
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  sendBtnActive: {
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)' as any,
  },
});
