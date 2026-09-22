import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/theme';

export interface OnlineStatusProps {
  isOnline: boolean;
  showText?: boolean;
  text?: string;
  size?: number;
  style?: ViewStyle;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  isOnline,
  showText = false,
  text,
  size = 9,
  style,
}) => {
  const { colors } = useTheme();

  const defaultText = isOnline ? 'Đang hoạt động' : 'Không hoạt động';

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.dotOuter,
          {
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            backgroundColor: isOnline ? (colors.onlineGlow || 'rgba(16, 185, 129, 0.25)') : 'transparent',
          },
        ]}
      >
        <View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isOnline ? colors.online : colors.offline,
            },
            isOnline &&
              Platform.OS === 'web' &&
              ({
                boxShadow: `0 0 8px 1px ${colors.online}`,
              } as any),
          ]}
        />
      </View>
      {showText && (
        <Text
          style={[
            Typography.caption,
            styles.statusText,
            { color: isOnline ? colors.online : colors.textSecondary },
          ]}
        >
          {text || defaultText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
  statusText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
