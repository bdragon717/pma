/**
 * Theme
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const fonts = Platform.select({
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

export const colors = {
    primary: "#4CAF50",
    black: '#000000',
    blackSt: '#333333',    
    blackNd: 'rgba(0, 0, 0, 0.5)',
    blackRd: 'rgba(0,0,0,0.12)',
    blackFd:'rgba(0,0,0,0.3)',
    white: '#ffffff',
    offWhite: '#f9f9f9',
    whiteSmoke: '#f5f5f5',
    //dark: '#242c40',
    //light: '#d0d0c0',
    green: '#4CAF50',
    gray: '#eeeeee',
    silverGray: '#cccccc',
    lightGraySt: '#dddddd',
    lightGraySn: '#e0e0e0',
    lightGrayTh: '#f0f0f0',
    lightGrayfh: '#a1a1a1',
    lightGrayft: '#d1d1d1',
    lightGraysx: '#F5F5F5',    
    darkGray: '#666666',
    midGray: '#999999',
    blue: '#0000FF',
    vividBlue: '#007AFF',
    paleGreyBlue: '#ECEDEE',
    paleBlue: '#e6f0ff',    
    pastelBlue: '#E3F2FD',
    skyBlue: '#87CEEB',
    lightSkyBlue: '#87CEFA',
    lightBlue: '#ADD8E6',
    deepSkyBlue: '#00BFFF', 
    lotion: '#fafafa', 
    peachPink: '#FFD1DC',

    light: {
      text: '#11181C',
      background: '#fff',
      tint: tintColorLight,
      icon: '#687076',
      tabIconDefault: '#687076',
      tabIconSelected: tintColorLight,
    },
    dark: {
      text: '#ECEDEE',
      background: '#151718',
      tint: tintColorDark,
      icon: '#9BA1A6',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: tintColorDark,
    },
};

export const spacings = {
    spac5: 5,
    spac8: 8,
    spac10: 10,
    spac12: 12,
    spac14: 14,
    spac16: 16,
    spac18: 18,
    spac20: 20,
    spac22: 22,
    spac24: 24,
    spac26: 26,
    spac28: 28,
    spac30: 30,
    spac32: 32,
    spac34: 34,
    spac36: 36,
};

export const sizes = {
    size8: 8,
    size10: 10,
    size12: 12,
    size14: 14,
    size16: 16,
    size18: 18,
    size20: 20,
    size22: 22,
    size24: 24,
    size26: 26,
    size28: 28,
    size30: 30,
    size32: 32,
    size34: 34,
    size36: 36,
};