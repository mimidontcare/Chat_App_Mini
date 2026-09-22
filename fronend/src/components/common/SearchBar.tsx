import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../../constants/theme';

export interface SearchBarProps {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  loading?: boolean;
  onClear?: () => void;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm bạn bè hoặc tin nhắn...',
  loading = false,
  onClear,
  onPress,
  editable = true,
  autoFocus = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onClear) onClear();
    if (onChangeText) onChangeText('');
  };

  const content = (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
        },
        Shadows.sm,
        isFocused &&
          Platform.OS === 'web' &&
          ({
            boxShadow: `0 0 0 3px ${colors.primaryGlow || 'rgba(37, 99, 235, 0.15)'}`,
          } as any),
        style,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={19}
        color={isFocused ? colors.primary : colors.textMuted}
        style={styles.searchIcon}
      />
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
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        editable={editable && !onPress}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.clearIcon} />
      ) : value && value.length > 0 ? (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          style={styles.clearIcon}
          accessibilityRole="button"
          accessibilityLabel="Xóa tìm kiếm"
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.5,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    transitionDuration: '150ms',
  } as any,
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 14,
  },
  clearIcon: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
