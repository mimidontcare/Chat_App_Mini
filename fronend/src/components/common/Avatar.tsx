import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Shadows } from '../../constants/theme';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  isOnline?: boolean;
  showStatus?: boolean;
  hasRing?: boolean;
  ringColor?: string;
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: 36,
  md: 48,
  lg: 60,
  xl: 96,
};

// Bảng màu gradient phong phú cho Fallback Avatar theo tên người dùng
const FALLBACK_PALETTES = [
  { bg: '#3B82F6', text: '#FFFFFF', border: '#60A5FA' },
  { bg: '#6366F1', text: '#FFFFFF', border: '#818CF8' },
  { bg: '#8B5CF6', text: '#FFFFFF', border: '#A78BFA' },
  { bg: '#EC4899', text: '#FFFFFF', border: '#F472B6' },
  { bg: '#10B981', text: '#FFFFFF', border: '#34D399' },
  { bg: '#06B6D4', text: '#FFFFFF', border: '#22D3EE' },
  { bg: '#F59E0B', text: '#FFFFFF', border: '#FBBF24' },
];

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 'md',
  isOnline = false,
  showStatus = false,
  hasRing = false,
  ringColor,
  style,
}) => {
  const { colors } = useTheme();
  const [hasError, setHasError] = useState(false);

  const dimension = typeof size === 'number' ? size : SIZE_MAP[size];
  const badgeSize = Math.max(11, Math.round(dimension * 0.27));

  const getInitials = (str: string) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Chọn màu fallback cố định dựa trên tên
  const getPalette = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % FALLBACK_PALETTES.length;
    return FALLBACK_PALETTES[index];
  };

  const palette = getPalette(name);
  const showImage = uri && !hasError;
  const effectiveRingColor = ringColor || (isOnline ? colors.online : colors.primary);

  return (
    <View
      style={[
        { width: dimension, height: dimension },
        styles.container,
        hasRing && {
          padding: 2,
          borderRadius: dimension / 2 + 4,
          borderWidth: 2,
          borderColor: effectiveRingColor,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            borderWidth: 1.5,
            borderColor: colors.surface,
          }}
          contentFit="cover"
          transition={250}
          onError={() => setHasError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: palette.bg,
              borderColor: palette.border,
              borderWidth: 1,
            },
            Shadows.sm,
          ]}
        >
          <Text
            style={[
              Typography.title,
              {
                fontSize: Math.round(dimension * 0.38),
                color: palette.text,
                fontWeight: '800',
                letterSpacing: 0.5,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showStatus && isOnline && (
        <View
          style={[
            styles.statusBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: colors.online,
              borderColor: colors.surface,
              borderWidth: Math.max(2, badgeSize * 0.22),
            },
            Platform.OS === 'web'
              ? ({
                  boxShadow: `0 0 6px 1px ${colors.onlineGlow || 'rgba(16, 185, 129, 0.5)'}`,
                } as any)
              : null,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
});
