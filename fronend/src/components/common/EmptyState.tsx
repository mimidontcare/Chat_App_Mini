import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'chatbubbles-outline',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.primaryLight,
            borderColor: colors.borderLight,
          },
          Shadows.sm,
        ]}
      >
        <Ionicons name={icon} size={42} color={colors.primary} />
      </View>

      <Text style={[Typography.title, styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>

      <Text
        style={[
          Typography.body,
          styles.description,
          { color: colors.textSecondary },
        ]}
      >
        {description}
      </Text>

      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.xs + 2,
    fontWeight: '700',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    maxWidth: 320,
    fontSize: 14,
  },
  actionButton: {
    minWidth: 170,
  },
});
