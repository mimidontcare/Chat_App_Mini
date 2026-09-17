import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius } from '../../constants/theme';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  isOnline?: boolean;
  showStatus?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: 34,
  md: 46,
  lg: 58,
  xl: 92,
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 'md',
  isOnline = false,
  showStatus = false,
  style,
}) => {
  const { colors } = useTheme();
  const [hasError, setHasError] = useState(false);

  const dimension = typeof size === 'number' ? size : SIZE_MAP[size];
  const badgeSize = Math.max(10, Math.round(dimension * 0.26));

  const getInitials = (str: string) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const showImage = uri && !hasError;

  return (
    <View style={[{ width: dimension, height: dimension }, styles.container, style]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
          contentFit="cover"
          transition={200}
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
              backgroundColor: colors.primaryLight,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              Typography.title,
              {
                fontSize: Math.round(dimension * 0.38),
                color: colors.primary,
                fontWeight: '600',
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showStatus && (
        <View
          style={[
            styles.statusBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: isOnline ? colors.online : colors.offline,
              borderColor: colors.surface,
              borderWidth: Math.max(1.5, badgeSize * 0.2),
            },
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
    borderWidth: 1,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
