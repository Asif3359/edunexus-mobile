/**
 * EduNexus App Color Scheme
 * Purple, Black, and White theme
 */

const primaryPurple = '#8B5CF6';
const darkPurple = '#7C3AED';
const lightPurple = '#A78BFA';
const white = '#FFFFFF';
const black = '#000000';
const darkGray = '#1F2937';
const lightGray = '#F3F4F6';

export const Colors = {
  light: {
    text: black,
    background: white,
    tint: primaryPurple,
    icon: darkGray,
    tabIconDefault: darkGray,
    tabIconSelected: primaryPurple,
    primary: primaryPurple,
    secondary: darkPurple,
    accent: lightPurple,
    surface: lightGray,
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    text: white,
    background: black,
    tint: lightPurple,
    icon: lightGray,
    tabIconDefault: lightGray,
    tabIconSelected: lightPurple,
    primary: primaryPurple,
    secondary: darkPurple,
    accent: lightPurple,
    surface: darkGray,
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
};
