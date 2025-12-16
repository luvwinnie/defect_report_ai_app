// Theme configuration matching the web app's MUI theme

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// Colors matching the web app's MUI theme
const colors = {
  // Primary - Blue
  primary: '#1976d2',
  primaryDark: '#1565c0',
  primaryLight: '#42a5f5',

  // Success - Green
  success: '#2e7d32',
  successDark: '#1b5e20',
  successLight: '#4caf50',

  // Info - Light Blue
  info: '#0288d1',
  infoDark: '#01579b',
  infoLight: '#03a9f4',

  // Warning - Orange
  warning: '#ed6c02',
  warningDark: '#e65100',
  warningLight: '#ff9800',

  // Error - Red
  error: '#d32f2f',
  errorDark: '#c62828',
  errorLight: '#ef5350',

  // Grays
  grey50: '#fafafa',
  grey100: '#f5f5f5',
  grey200: '#eeeeee',
  grey300: '#e0e0e0',
  grey400: '#bdbdbd',
  grey500: '#9e9e9e',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  // Background
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',

  // Text
  textPrimary: 'rgba(0, 0, 0, 0.87)',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  textDisabled: 'rgba(0, 0, 0, 0.38)',
};

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.info,
    secondaryContainer: colors.infoLight,
    tertiary: colors.warning,
    tertiaryContainer: colors.warningLight,
    error: colors.error,
    errorContainer: colors.errorLight,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#ffffff',
    onError: '#ffffff',
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    outline: colors.grey400,
    outlineVariant: colors.grey200,
  },
  roundness: 8,
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primaryDark,
    secondary: colors.infoLight,
    secondaryContainer: colors.infoDark,
    tertiary: colors.warningLight,
    tertiaryContainer: colors.warningDark,
    error: colors.errorLight,
    errorContainer: colors.errorDark,
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2c2c2c',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onTertiary: '#000000',
    onError: '#000000',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    outline: colors.grey600,
    outlineVariant: colors.grey800,
  },
  roundness: 8,
};

// Section colors for sidebar (matching web app)
export const sectionColors = {
  executive: colors.primary,
  input: colors.success,
  analysis: colors.info,
  knowledge: colors.warning,
  admin: colors.error,
  settings: colors.grey700,
};

// Severity colors
export const severityColors = {
  critical: colors.error,
  high: colors.warning,
  medium: colors.info,
  low: colors.success,
};

// Export color constants
export { colors };

export type AppTheme = typeof lightTheme;
