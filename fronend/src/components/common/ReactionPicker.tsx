import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { MESSENGER_REACTIONS } from '../../constants/emojis';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Shadows, Spacing } from '../../constants/theme';

interface ReactionPickerProps {
  visible: boolean;
  currentReaction?: string | null;
  onSelectReaction: (emoji: string) => void;
  onClose: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  visible,
  currentReaction,
  onSelectReaction,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
            Shadows.lg,
          ]}
          onStartShouldSetResponder={() => true}
        >
          {MESSENGER_REACTIONS.map((item) => {
            const isSelected = currentReaction === item.emoji;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  onSelectReaction(item.emoji);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.reactionButton,
                  isSelected && {
                    backgroundColor: colors.surfaceSecondary,
                    transform: [{ scale: 1.15 }],
                  },
                  pressed && {
                    transform: [{ scale: 1.25 }],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Text style={styles.emojiText}>{item.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: Platform.OS === 'web' ? 8 : 4,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    transitionDuration: '150ms',
  } as any,
  emojiText: {
    fontSize: 26,
    textAlign: 'center',
  },
});
