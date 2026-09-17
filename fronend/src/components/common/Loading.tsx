import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Spacing, Radius } from '../../constants/theme';

export interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'large',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.container,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={colors.primary} />
      {message ? (
        <Text style={[Typography.subtext, styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

export const ConversationSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={styles.skeletonRow}>
          <View
            style={[
              styles.skeletonAvatar,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          />
          <View style={styles.skeletonTextCol}>
            <View
              style={[
                styles.skeletonBarTitle,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            />
            <View
              style={[
                styles.skeletonBarSub,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing.md,
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  skeletonTextCol: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  skeletonBarTitle: {
    width: '45%',
    height: 14,
    borderRadius: Radius.xs,
    marginBottom: Spacing.xs + 2,
  },
  skeletonBarSub: {
    width: '75%',
    height: 12,
    borderRadius: Radius.xs,
  },
});
