/**
 * Tramonto Sereno - Design System Colors
 * Brand colors based on the aussie-funeral palette
 */

import { Platform } from 'react-native';

// Base colors
export const BaseColors = {
  // Black shades
  blackMedium: '#292F36',
  black: '#050505',

  // Brand colors
  blue: '#0091ff',
  greenDark: '#005742',
  greenLight: '#e5f4f0',
  greenLightest: '#f7fbfa',
  green: '#b2ded3',

  // Grey shades
  greyDark: '#b7bcc3',
  greyLight: '#e0e3e8',
  greyLightest: '#f5f5f5',
  greyMedium: '#585858',
  grey: '#999999',

  // Accent colors
  orange: '#FF6A00',
  red: '#CC0000',
  white: '#FFFFFF',
  yellow: '#ffc107',

  // Main brand palette (aussie-funeral)
  main: '#bf9574',
  mainDark: '#ab8668',
  mainLight: '#d6b89c',
  mainLightest: '#f6f0eb',
  mainLightestest: '#fbf9f7',

  // Status colors
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',

  // Border colors
  border: '#585858',
  borderLight: 'rgba(29, 51, 74, 0.1)',
};

const tintColorLight = BaseColors.main;
const tintColorDark = BaseColors.mainLight;

export const Colors = {
  light: {
    text: BaseColors.black,
    background: BaseColors.white,
    cardBackground: BaseColors.greyLightest,
    tint: tintColorLight,
    icon: BaseColors.greyMedium,
    tabIconDefault: BaseColors.greyMedium,
    tabIconSelected: tintColorLight,
    border: BaseColors.borderLight,
    success: BaseColors.success,
    danger: BaseColors.danger,
    warning: BaseColors.warning,
  },
  dark: {
    text: BaseColors.white,
    background: BaseColors.blackMedium,
    cardBackground: BaseColors.black,
    tint: tintColorDark,
    icon: BaseColors.greyDark,
    tabIconDefault: BaseColors.greyDark,
    tabIconSelected: tintColorDark,
    border: BaseColors.borderLight,
    success: BaseColors.success,
    danger: BaseColors.danger,
    warning: BaseColors.warning,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
