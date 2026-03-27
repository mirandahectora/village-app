export const colors = {
  cream:      '#F4EEE2',
  creamMid:   '#EDE5D4',
  creamDark:  '#E0D5C1',
  ink:        '#1C1A14',
  inkMuted:   '#5A5446',
  green:      '#2A4A1E',
  greenMid:   '#3D6B2C',
  greenLight: '#C8DDB8',
  terracotta: '#C05030',
  terraMid:   '#D4694A',
  terraLight: '#F0C9BB',
  rule:       '#C4BAA8',
  white:      '#FFFFFF',
}

// React Native doesn't support custom fonts as CSS variables,
// but we reference them by family name after loading via expo-font.
export const fonts = {
  sans:  'DMSans',
  serif: 'PlayfairDisplay',
  mono:  'DMMono',
  // Fallbacks used before fonts load
  sansDefault:  'System',
  serifDefault: 'Georgia',
  monoDefault:  'Courier New',
}
