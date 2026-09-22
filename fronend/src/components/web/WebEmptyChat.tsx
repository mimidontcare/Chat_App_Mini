import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface WebEmptyChatProps {
  onOpenSearch?: () => void;
  onOpenFriends?: () => void;
}

export const WebEmptyChat: React.FC<WebEmptyChatProps> = ({
  onOpenSearch,
  onOpenFriends,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Centered Graphic Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.08)',
            borderColor: isDark ? 'rgba(37, 99, 235, 0.25)' : 'rgba(37, 99, 235, 0.18)',
          },
        ]}
      >
        <Ionicons name="chatbubbles" size={48} color={colors.primary} />
      </View>

      {/* Title & Description */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Chào mừng bạn đến với Chat App Web
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin, hoặc kết nối với bạn bè mới.
      </Text>

      {/* Quick Action Buttons */}
      <View style={styles.buttonRow}>
        {onOpenSearch && (
          <Pressable
            onPress={onOpenSearch}
            style={({ hovered }: any) => [
              styles.btn,
              { backgroundColor: colors.primary },
              hovered && { transform: [{ scale: 1.03 }] },
            ]}
          >
            <Ionicons name="search-outline" size={16} color="#FFFFFF" />
            <Text style={styles.btnText}>Tìm kiếm bạn bè</Text>
          </Pressable>
        )}

        {onOpenFriends && (
          <Pressable
            onPress={onOpenFriends}
            style={({ hovered }: any) => [
              styles.btnOutline,
              {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
              },
              hovered && { transform: [{ scale: 1.03 }] },
            ]}
          >
            <Ionicons name="people-outline" size={16} color={colors.textPrimary} />
            <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>
              Xem danh bạ
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    textAlign: 'center' as any,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  btnOutlineText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
