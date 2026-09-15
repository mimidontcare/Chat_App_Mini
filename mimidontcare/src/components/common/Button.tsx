import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../../constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  // Determine container dimensions based on size
  const sizeStyles: ViewStyle = {
    sm: { height: 36, paddingHorizontal: Spacing.md, borderRadius: Radius.sm },
    md: { height: 46, paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
    lg: { height: 52, paddingHorizontal: Spacing.xl, borderRadius: Radius.md },
  }[size];

  // Font size mapping
  const textSizes: TextStyle = {
    sm: { fontSize: 13, lineHeight: 18 },
    md: { fontSize: 15, lineHeight: 20 },
    lg: { fontSize: 16, lineHeight: 22 },
  }[size];

  // Background and border mapping
  let bgStyle: ViewStyle = {};
  let textColor: string = colors.onPrimary;

  switch (variant) {
    case 'primary':
      bgStyle = { backgroundColor: colors.primary, ...Shadows.sm };
      textColor = colors.onPrimary;
      break;
    case 'secondary':
      bgStyle = { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border };
      textColor = colors.textPrimary;
      break;
    case 'outline':
      bgStyle = { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      textColor = colors.primary;
      break;
    case 'destructive':
      bgStyle = { backgroundColor: colors.destructiveLight };
      textColor = colors.destructive;
      break;
    case 'ghost':
      bgStyle = { backgroundColor: 'transparent' };
      textColor = colors.primary;
      break;
  }

  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      style={({ pressed }) => [
        styles.base,
        sizeStyles,
        bgStyle,
        disabled && styles.disabled,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
      android_ripple={
        isInteractive
          ? {
              color: variant === 'primary' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
            }
          : null
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.onPrimary : colors.primary}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          <Text
            style={[
              Typography.bodyMedium,
              textSizes,
              { color: disabled ? colors.textMuted : textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: Spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: Spacing.sm,
  },
  pressed: {
    opacity: Platform.OS === 'ios' ? 0.8 : 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
