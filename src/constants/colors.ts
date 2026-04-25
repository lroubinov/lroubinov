export const Colors = {
  bg: {
    deepest: '#0A0010',
    dark: '#150020',
    surface: '#1E0035',
    overlay: 'rgba(10, 0, 16, 0.85)',
  },
  brand: {
    purple: '#7B2FBE',
    purpleLight: '#A855F7',
    pink: '#E040A0',
    pinkLight: '#F472B6',
    gold: '#F4C542',
    goldLight: '#FDE68A',
    crimson: '#C1121F',
    rose: '#FF6B9D',
  },
  text: {
    primary: '#FAF0FF',
    secondary: '#C4A8D4',
    muted: '#7A6880',
    gold: '#F4C542',
  },
  level: {
    hot: { bg: '#3D1A00', text: '#FF6B2B', border: '#FF6B2B' },
    scorching: { bg: '#3D0020', text: '#FF2D6B', border: '#FF2D6B' },
    hardcore: { bg: '#1A0038', text: '#BF5FFF', border: '#BF5FFF' },
  },
  gradient: {
    splash: ['#0A0010', '#1E0035', '#3D1060'] as const,
    card: ['#1E0035', '#2D0050'] as const,
    dare: ['#3D0010', '#1E0035'] as const,
    truth: ['#0D0030', '#1E0035'] as const,
    gold: ['#F4C542', '#C97D20'] as const,
    button: {
      truth: ['#1a0040', '#3D0070'] as const,
      dare: ['#400010', '#7D0020'] as const,
      done: ['#1a3a00', '#3D7000'] as const,
      skip: ['#2a1a00', '#3a2200'] as const,
    },
  },
};
