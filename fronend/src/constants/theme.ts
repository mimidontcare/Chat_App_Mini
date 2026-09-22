import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Pro Max Design System Tokens - Modern Electric Blue & Indigo
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#EFF6FF',
    primaryLighter: '#F5F9FF',
    onPrimary: '#FFFFFF',

    secondary: '#6366F1',
    secondaryLight: '#EEF2FF',
    onSecondary: '#FFFFFF',

    accent: '#06B6D4',
    accentLight: '#ECFEFF',
    onAccent: '#FFFFFF',

    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFC',
    surfaceHover: '#F1F5F9',
    surfaceActive: '#E2E8F0',

    text: '#0F172A',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textPlaceholder: '#94A3B8',

    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',

    online: '#10B981',
    onlineLight: '#D1FAE5',
    offline: '#94A3B8',
    success: '#10B981',

    destructive: '#EF4444',
    destructiveLight: '#FEE2E2',
    onDestructive: '#FFFFFF',

    warning: '#F59E0B',
    warningLight: '#FEF3C7',

    incomingBubble: '#F1F5F9',
    incomingBubbleText: '#0F172A',
    incomingBubbleBorder: 'rgba(226, 232, 240, 0.8)',
    outgoingBubble: '#2563EB',
    outgoingBubbleEnd: '#4F46E5',
    outgoingBubbleText: '#FFFFFF',

    readTick: '#38BDF8',
    unreadBadge: '#EF4444',
    card: '#FFFFFF',

    // Glassmorphic & Aura Tokens
    glassBg: 'rgba(255, 255, 255, 0.86)',
    glassBorder: 'rgba(226, 232, 240, 0.85)',
    floatingDock: 'rgba(255, 255, 255, 0.94)',
    overlayBg: 'rgba(15, 23, 42, 0.4)',
    primaryGlow: 'rgba(37, 99, 235, 0.25)',
    onlineGlow: 'rgba(16, 185, 129, 0.35)',
    cardGlow: 'rgba(37, 99, 235, 0.04)',

    // Backward compatibility tokens
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
  },
  dark: {
    // Pro Max Design System Tokens - Deep OLED Slate Luxury
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#1E293B',
    primaryLighter: '#152033',
    onPrimary: '#FFFFFF',

    secondary: '#818CF8',
    secondaryLight: '#1F2442',
    onSecondary: '#FFFFFF',

    accent: '#22D3EE',
    accentLight: '#11293B',
    onAccent: '#FFFFFF',

    background: '#080C14',
    backgroundSecondary: '#0F1626',
    surface: '#121A2B',
    surfaceSecondary: '#192339',
    surfaceHover: '#23304B',
    surfaceActive: '#2D3D5E',

    text: '#F8FAFC',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textPlaceholder: '#64748B',

    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.04)',
    divider: 'rgba(255, 255, 255, 0.07)',

    online: '#10B981',
    onlineLight: '#064E3B',
    offline: '#64748B',
    success: '#10B981',

    destructive: '#F87171',
    destructiveLight: '#451A1A',
    onDestructive: '#FFFFFF',

    warning: '#FBBF24',
    warningLight: '#452C06',

    incomingBubble: '#192339',
    incomingBubbleText: '#F8FAFC',
    incomingBubbleBorder: 'rgba(255, 255, 255, 0.07)',
    outgoingBubble: '#2563EB',
    outgoingBubbleEnd: '#4F46E5',
    outgoingBubbleText: '#FFFFFF',

    readTick: '#38BDF8',
    unreadBadge: '#EF4444',
    card: '#121A2B',

    // Glassmorphic & Aura Tokens
    glassBg: 'rgba(18, 26, 43, 0.88)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    floatingDock: 'rgba(15, 22, 38, 0.94)',
    overlayBg: 'rgba(0, 0, 0, 0.65)',
    primaryGlow: 'rgba(59, 130, 246, 0.3)',
    onlineGlow: 'rgba(16, 185, 129, 0.45)',
    cardGlow: 'rgba(59, 130, 246, 0.07)',

    // Backward compatibility tokens
    backgroundElement: '#1A2234',
    backgroundSelected: '#25324D',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
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
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500' as const,
  },
  subtext: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
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
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 9999,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    android: {
      elevation: 1.5,
    },
    default: {
      boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.06)',
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
    },
  }),
  glow: Platform.select({
    ios: {
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {
      boxShadow: '0 4px 16px 0 rgba(37, 99, 235, 0.35)',
    },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
    },
    android: {
      elevation: 10,
    },
    default: {
      boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    },
  }),
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1040;
