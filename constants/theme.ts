// constants/theme.ts

export const colors = {
  // Core palette — warm, earthy, sacred
  sand: '#F5F0E8', // primary background
  sandLight: '#FAF7F2', // card backgrounds
  sandDark: '#E8E0D0', // borders, dividers

  clay: '#C4956A', // warm accent
  clayLight: '#D4AD8A', // hover/active states
  clayDark: '#A67A52', // pressed states

  earth: '#5C4033', // primary text
  earthLight: '#7A6355', // secondary text
  earthMuted: '#9B8B7E', // placeholder text
  earthDark: '#3D3029', // deep warm background (intention screen)

  sage: '#7A8B6F', // success, growth, progress
  sageDark: '#5E6F53', // active/dark variant

  terracotta: '#C75B39', // alerts, important actions
  indigo: '#4A5568', // links, interactive elements

  white: '#FFFFFF',
  black: '#1A1A1A',

  // Dosha colors
  vata: '#8B9FBF', // airy blue-gray
  pitta: '#C75B39', // fiery terracotta
  kapha: '#7A8B6F', // earthy sage

  // Chakra colors (for future use)
  muladhara: '#C75B39',
  svadhisthana: '#D4874D',
  manipura: '#D4AD4D',
  anahata: '#7A8B6F',
  vishuddha: '#6B8BA4',
  ajna: '#6B5B8A',
  sahasrara: '#9B7BB5',
};

export const fonts = {
  // Use system fonts for now — swap for custom fonts later
  // To add custom fonts: npx expo install expo-font
  heading: 'System', // replace with a serif like 'Cormorant' later
  body: 'System', // replace with something like 'Lora' later
  mono: 'monospace',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const textStyles = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.earth,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.earth,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.earth,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.earth,
    lineHeight: 26,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.earthLight,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.earthMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    lineHeight: 16,
  },
  sanskrit: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.clayDark,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
};
