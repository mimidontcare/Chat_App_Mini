import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { WebPeerData } from './types';

interface WebChatHeaderProps {
  peer: WebPeerData;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onVoiceCallPress?: () => void;
  onVideoCallPress?: () => void;
  onInfoPress?: () => void;
}

export const WebChatHeader: React.FC<WebChatHeaderProps> = ({
  peer,
  showBackButton = false,
  onBackPress,
  onVoiceCallPress,
  onVideoCallPress,
  onInfoPress,
}) => {
  const { colors, isDark } = useTheme();

  const handleVoiceCall = () => {
    if (onVoiceCallPress) {
      onVoiceCallPress();
    } else {
      alert('Tính năng gọi thoại đang được hoàn thiện!');
    }
  };

  const handleVideoCall = () => {
    if (onVideoCallPress) {
      onVideoCallPress();
    } else {
      alert('Tính năng gọi video đang được hoàn thiện!');
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? '#0F1626' : '#FFFFFF',
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(226, 232, 240, 0.9)',
        },
      ]}
    >
      {/* Left: Back button (if needed) + Peer Avatar & Name */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable
            onPress={onBackPress}
            style={({ hovered }: any) => [
              styles.backBtn,
              hovered && {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
              },
            ]}
            accessibilityLabel="Quay lại danh sách"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
        )}

        <Avatar
          uri={peer?.avatar_url}
          name={peer?.username || 'User'}
          size={40}
          isOnline={peer?.is_online}
        />

        <View style={styles.peerInfo}>
          <Text
            numberOfLines={1}
            style={[styles.peerName, { color: colors.textPrimary }]}
          >
            {peer?.username || 'Người dùng'}
          </Text>
          <View style={styles.statusRow}>
            {peer?.is_online ? (
              <>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Đang hoạt động</Text>
              </>
            ) : (
              <Text style={[styles.offlineText, { color: colors.textMuted }]}>
                {peer?.last_seen ? 'Đang ngoại tuyến' : 'Ngoại tuyến'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Right: Actions (Voice Call, Video Call, Details) */}
      <View style={styles.rightSection}>
        {/* Voice Call */}
        <Pressable
          onPress={handleVoiceCall}
          style={({ hovered }: any) => [
            styles.actionBtn,
            hovered && {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
            },
          ]}
          accessibilityLabel="Gọi thoại"
        >
          <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Video Call */}
        <Pressable
          onPress={handleVideoCall}
          style={({ hovered }: any) => [
            styles.actionBtn,
            hovered && {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
            },
          ]}
          accessibilityLabel="Gọi video"
        >
          <Ionicons name="videocam-outline" size={21} color={colors.textSecondary} />
        </Pressable>

        {/* Info */}
        <Pressable
          onPress={onInfoPress}
          style={({ hovered }: any) => [
            styles.actionBtn,
            hovered && {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
            },
          ]}
          accessibilityLabel="Thông tin hội thoại"
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    ...(Platform.OS === 'web' ? ({ userSelect: 'none' } as any) : {}),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  peerInfo: {
    gap: 2,
    flex: 1,
  },
  peerName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 9999,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '500',
  },
  offlineText: {
    fontSize: 11.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        } as any)
      : {}),
  },
});
