import React from 'react';
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
import { Typography, Radius, Spacing } from '../../constants/theme';

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
  placeholder = 'Tìm kiếm bạn bè hoặc người dùng...',
  loading = false,
  onClear,
  onPress,
  editable = true,
  autoFocus = false,
  style,
}) => {
  const { colors } = useTheme();

  const handleClear = () => {
    if (onClear) onClear();
    if (onChangeText) onChangeText('');
  };

  const content = (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        style={[
          Typography.body,
          styles.input,
          { color: colors.textPrimary },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        editable={editable && !onPress}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.clearIcon} />
      ) : value.length > 0 ? (
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
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
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
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outlineColor: 'transparent',
          boxShadow: 'none',
        } as any)
      : {}),
  },
  clearIcon: {
    marginLeft: Spacing.xs,
    padding: Spacing.xs,
  },
});
