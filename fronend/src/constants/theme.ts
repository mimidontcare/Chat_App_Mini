import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Pro Max Design System Tokens
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#EFF6FF',
    onPrimary: '#FFFFFF',

    secondary: '#6366F1',
    onSecondary: '#FFFFFF',

    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    surfaceHover: '#E2E8F0',

    text: '#0F172A',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textPlaceholder: '#94A3B8',

    border: '#E2E8F0',
    borderLight: '#F1F5F9',

    online: '#10B981',
    offline: '#94A3B8',

    destructive: '#EF4444',
    destructiveLight: '#FEE2E2',
    onDestructive: '#FFFFFF',

    warning: '#F59E0B',
    warningLight: '#FEF3C7',

    incomingBubble: '#F1F5F9',
    incomingBubbleText: '#0F172A',
    outgoingBubble: '#2563EB',
    outgoingBubbleText: '#FFFFFF',

    readTick: '#38BDF8',
    unreadBadge: '#EF4444',
    card: '#FFFFFF',

    // Backward compatibility tokens
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
  },
  dark: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#1E293B',
    onPrimary: '#FFFFFF',

    secondary: '#818CF8',
    onSecondary: '#FFFFFF',

    background: '#0B0F17',
    surface: '#151D2A',
    surfaceSecondary: '#1E293B',
    surfaceHover: '#334155',

    text: '#F8FAFC',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textPlaceholder: '#64748B',

    border: '#263345',
    borderLight: '#1E293B',

    online: '#10B981',
    offline: '#64748B',

    destructive: '#F87171',
    destructiveLight: '#451A1A',
    onDestructive: '#FFFFFF',

    warning: '#FBBF24',
    warningLight: '#452C06',

    incomingBubble: '#1E293B',
    incomingBubbleText: '#F8FAFC',
    outgoingBubble: '#2563EB',
    outgoingBubbleText: '#FFFFFF',

    readTick: '#38BDF8',
    unreadBadge: '#EF4444',
    card: '#151D2A',

    // Backward compatibility tokens
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
  },
} as const;

export type ThemeColors = typeof Colors.light;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  headline: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  subtext: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
};

export const Spacing = {
  // Numeric tokens
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  // Named tokens (backward compatibility)
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 9999,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.09,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
