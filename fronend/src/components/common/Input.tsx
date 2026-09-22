import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  showClear?: boolean;
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  showClear = false,
  onClear,
  containerStyle,
  style,
  value,
  ...rest
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[Typography.subtext, styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
            borderColor: error
              ? colors.destructive
              : isFocused
              ? colors.primary
              : colors.border,
          },
          Shadows.sm,
          isFocused &&
            Platform.OS === 'web' &&
            ({
              boxShadow: `0 0 0 3px ${
                error ? 'rgba(239, 68, 68, 0.15)' : colors.primaryGlow || 'rgba(37, 99, 235, 0.15)'
              }`,
            } as any),
        ]}
      >
        {leftIcon ? (
          <View style={styles.leftIcon}>
            <Ionicons
              name={leftIcon}
              size={20}
              color={isFocused ? colors.primary : colors.textMuted}
            />
          </View>
        ) : null}

        <TextInput
          style={[
            Typography.body,
            styles.input,
            { color: colors.textPrimary },
            Platform.OS === 'web'
              ? ({
                  outlineStyle: 'none',
                  outlineWidth: 0,
                  outlineColor: 'transparent',
                } as any)
              : null,
            style,
          ]}
          value={value}
          placeholderTextColor={colors.textPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...rest}
        />

        {showClear && value && value.length > 0 && onClear && (
          <Pressable onPress={onClear} style={styles.clearBtn} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}

        {isPassword ? (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isPasswordVisible ? colors.primary : colors.textMuted}
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            hitSlop={8}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle" size={14} color={colors.destructive} />
          <Text style={[Typography.caption, styles.errorText, { color: colors.destructive }]}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text style={[Typography.caption, styles.hintText, { color: colors.textMuted }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs + 2,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    transitionDuration: '150ms',
  } as any,
  leftIcon: {
    marginRight: Spacing.sm + 2,
  },
  rightIcon: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  clearBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs + 2,
  },
  errorText: {
    fontWeight: '500',
  },
  hintText: {
    marginTop: Spacing.xs + 2,
  },
});
