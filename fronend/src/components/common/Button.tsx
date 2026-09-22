import React, { useState } from 'react';
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
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'glass';
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
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Kích thước chuẩn Pro Max Design System
  const sizeStyles: ViewStyle = {
    sm: { height: 38, paddingHorizontal: Spacing.md, borderRadius: Radius.sm },
    md: { height: 48, paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
    lg: { height: 54, paddingHorizontal: Spacing.xl, borderRadius: Radius.lg },
  }[size];

  // Kích thước chữ và độ đậm
  const textSizes: TextStyle = {
    sm: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
    md: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
    lg: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  }[size];

  let bgStyle: ViewStyle = {};
  let textColor: string = colors.onPrimary;

  switch (variant) {
    case 'primary':
      bgStyle = {
        backgroundColor: colors.primary,
        ...(Shadows.glow as any),
        ...(Platform.OS === 'web'
          ? {
              backgroundImage: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              borderWidth: 0,
            }
          : {}),
      };
      textColor = colors.onPrimary;
      break;
    case 'secondary':
      bgStyle = {
        backgroundColor: colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        ...(Shadows.sm as any),
      };
      textColor = colors.textPrimary;
      break;
    case 'glass':
      bgStyle = {
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...(Platform.OS === 'web'
          ? {
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }
          : {}),
        ...(Shadows.sm as any),
      };
      textColor = colors.textPrimary;
      break;
    case 'outline':
      bgStyle = {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: isHovered ? colors.primaryDark : colors.primary,
      };
      textColor = colors.primary;
      break;
    case 'destructive':
      bgStyle = {
        backgroundColor: colors.destructiveLight,
        borderWidth: 1,
        borderColor: isDark ? colors.destructive : 'rgba(239, 68, 68, 0.2)',
      };
      textColor = colors.destructive;
      break;
    case 'ghost':
      bgStyle = {
        backgroundColor: isHovered ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent',
      };
      textColor = colors.primary;
      break;
  }

  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.base,
        sizeStyles,
        bgStyle,
        isHovered && isInteractive && styles.hovered,
        disabled && styles.disabled,
        pressed && isInteractive && styles.pressed,
        Platform.OS === 'web' ? ({ cursor: isInteractive ? 'pointer' : 'default' } as any) : null,
        style,
      ]}
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
    transitionDuration: '200ms',
  } as any,
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
  hovered: {
    opacity: 0.95,
    transform: [{ scale: 1.01 }],
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
