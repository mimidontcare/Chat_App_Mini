import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing } from '../../constants/theme';

export interface BadgeProps {
  count?: number;
  label?: string;
  variant?: 'primary' | 'destructive' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  label,
  variant = 'destructive',
  size = 'md',
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  if (count === 0 && !label) return null;

  const displayContent = count !== undefined ? (count > 99 ? '99+' : count.toString()) : label;

  let bg: string = colors.destructive;
  let text: string = colors.onDestructive;
  let border: string = 'transparent';

  switch (variant) {
    case 'primary':
      bg = colors.primary;
      text = colors.onPrimary;
      break;
    case 'secondary':
      bg = colors.surfaceSecondary;
      text = colors.textPrimary;
      break;
    case 'outline':
      bg = 'transparent';
      text = colors.primary;
      border = colors.primary;
      break;
    case 'destructive':
    default:
      bg = colors.destructive;
      text = colors.onDestructive;
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: border !== 'transparent' ? 1 : 0,
          minWidth: isSmall ? 16 : 20,
          height: isSmall ? 16 : 20,
          borderRadius: Radius.full,
          paddingHorizontal: isSmall ? 4 : 6,
        },
        style,
      ]}
    >
      <Text
        style={[
          Typography.caption,
          styles.text,
          {
            color: text,
            fontSize: isSmall ? 10 : 11,
            lineHeight: isSmall ? 12 : 14,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayContent}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
