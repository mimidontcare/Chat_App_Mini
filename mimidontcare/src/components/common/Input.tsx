import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
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
  containerStyle,
  style,
  ...rest
}) => {
  const { colors } = useTheme();
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
            backgroundColor: colors.surfaceSecondary,
            borderColor: error
              ? colors.destructive
              : isFocused
              ? colors.primary
              : colors.border,
          },
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
            style,
          ]}
          placeholderTextColor={colors.textPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...rest}
        />

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
              color={colors.textMuted}
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
          <Ionicons name="alert-circle-outline" size={14} color={colors.destructive} />
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
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.2,
    paddingHorizontal: Spacing.md,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  errorText: {
    fontWeight: '500',
  },
  hintText: {
    marginTop: Spacing.xs,
  },
});
