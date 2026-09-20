import { useThemeContext } from '../context/ThemeContext';

export function useTheme() {
  const context = useThemeContext();
  return {
    ...context,
    scheme: context.currentTheme,
  };
}

export type { ThemeMode, ActiveTheme } from '../context/ThemeContext';
