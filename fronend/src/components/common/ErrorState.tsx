import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Spacing, Radius } from '../../constants/theme';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Có lỗi xảy ra',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  retryText = 'Thử lại',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.destructiveLight }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
      </View>

      <Text style={[Typography.title, styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>

      <Text style={[Typography.body, styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>

      {onRetry && (
        <Button
          title={retryText}
          onPress={onRetry}
          variant="primary"
          size="md"
          leftIcon={<Ionicons name="refresh-outline" size={18} color={colors.onPrimary} />}
          style={styles.retryButton}
        />
      )}
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
    width: 76,
    height: 76,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  retryButton: {
    minWidth: 140,
  },
});
