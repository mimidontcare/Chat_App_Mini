import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMOJI_CATEGORIES } from '../../constants/emojis';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing, Shadows } from '../../constants/theme';

interface EmojiPickerProps {
  visible: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible,
  onSelectEmoji,
  onClose,
}) => {
  const { colors } = useTheme();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(EMOJI_CATEGORIES[0].id);

  if (!visible) return null;

  const activeCategory =
    EMOJI_CATEGORIES.find((cat) => cat.id === activeCategoryId) || EMOJI_CATEGORIES[0];

  return (
    <View
      style={[
        styles.pickerContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
        },
        Shadows.md,
      ]}
    >
      {/* Category Tabs Header */}
      <View
        style={[
          styles.tabBar,
          {
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {EMOJI_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategoryId(cat.id)}
                style={[
                  styles.tabItem,
                  isActive && {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.primary,
                  },
                ]}
                accessibilityRole="tab"
                accessibilityLabel={cat.name}
              >
                <Text style={styles.tabIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    Typography.caption,
                    styles.tabName,
                    {
                      color: isActive ? colors.primary : colors.textSecondary,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Nút đóng bảng Emoji */}
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Đóng bảng emoji"
        >
          <Ionicons name="close-circle" size={22} color={colors.textPlaceholder} />
        </Pressable>
      </View>

      {/* Emoji Grid Stream */}
      <ScrollView
        style={styles.emojiScroll}
        contentContainerStyle={styles.emojiGrid}
        showsVerticalScrollIndicator={false}
      >
        {activeCategory.emojis.map((emoji, index) => (
          <Pressable
            key={`${activeCategory.id}-${index}-${emoji}`}
            onPress={() => onSelectEmoji(emoji)}
            style={({ pressed }) => [
              styles.emojiCell,
              pressed && {
                backgroundColor: colors.surfaceSecondary,
                transform: [{ scale: 1.2 }],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Emoji ${emoji}`}
          >
            <Text style={styles.emojiGlyph}>{emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    height: 260,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabName: {
    fontSize: 12,
  },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  emojiScroll: {
    flex: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'space-between',
  },
  emojiCell: {
    width: Platform.OS === 'web' ? 44 : '12.5%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  emojiGlyph: {
    fontSize: 26,
    textAlign: 'center',
  },
});
