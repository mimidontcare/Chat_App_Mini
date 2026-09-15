import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography, Radius, Spacing } from '../../constants/theme';

export interface TypingIndicatorProps {
  username?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username = 'Someone' }) => {
  const { colors } = useTheme();

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: -4,
            duration: 350,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 150);
    const anim3 = createAnimation(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: colors.incomingBubble },
        ]}
      >
        <View style={styles.dotsRow}>
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.primary, transform: [{ translateY: dot1 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.primary, transform: [{ translateY: dot2 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.primary, transform: [{ translateY: dot3 }] },
            ]}
          />
        </View>
      </View>
      <Text style={[Typography.caption, styles.label, { color: colors.textSecondary }]}>
        {username} is typing...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: Radius.xs,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontStyle: 'italic',
  },
});
