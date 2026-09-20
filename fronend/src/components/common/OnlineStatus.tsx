import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius } from '../../constants/theme';

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
  size = 10,
  style,
}) => {
  const { colors } = useTheme();

  const defaultText = isOnline ? 'Đang hoạt động' : 'Không hoạt động';

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isOnline ? colors.online : colors.offline,
          },
        ]}
      />
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
  dot: {
    // tròn trịa
  },
  statusText: {
    fontWeight: '500',
  },
});
