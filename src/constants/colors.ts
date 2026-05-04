// Design tokens aligned with HTML mockup design system
export const Colors = {
  bg: {
    void:    '#060410',
    deepest: '#060410',
    deep:    '#0C0820',
    dark:    '#0C0820',
    surface: 'rgba(255,255,255,0.05)',
    overlay: 'rgba(6,4,16,0.85)',
  },
  brand: {
    fire:       '#FF4500',
    fire2:      '#FF7A00',   // alias kept for existing components
    fireHot:    '#FF7A00',
    fireWarm:   '#FFAD00',
    gold:       '#FFD560',
    goldLight:  '#FDE68A',
    ember:      '#FF2D5A',
    neonBlue:   '#3DD6F5',
    neonPink:   '#FF4FA3',
    chilli:     '#E84040',
    explode:    '#FF7A00',
    extreme:    '#C026D3',
    purple:     '#7B2FBE',
    purpleLight: '#A855F7',
    pink:       '#FF4FA3',   // alias kept for existing components
    pinkLight:  '#F472B6',
    crimson:    '#E84040',
    rose:       '#FF4FA3',
  },
  text: {
    primary: '#F5EEFF',                    // --c-text
    secondary: 'rgba(245,238,255,0.65)',
    muted: 'rgba(245,238,255,0.42)',       // --c-text-muted
    gold: '#FFD560',
  },
  border: {
    default: 'rgba(255,255,255,0.09)',     // --c-border
    bright:  'rgba(255,255,255,0.18)',     // --c-border-h
  },
  level: {
    hot:      { bg: 'rgba(232,64,64,0.08)',    text: '#E84040', border: '#E84040', glow: 'rgba(232,64,64,0.15)' },
    scorching:{ bg: 'rgba(255,100,0,0.08)',    text: '#FF7A00', border: '#FF7A00', glow: 'rgba(255,100,0,0.15)' },
    hardcore: { bg: 'rgba(192,38,211,0.10)',   text: '#C026D3', border: '#C026D3', glow: 'rgba(192,38,211,0.20)' },
  },
  gradient: {
    splash: ['#060410', '#0C0820', '#150030'] as const,
    fire:   ['#FF8500', '#FF4500', '#D42800'] as const,
    logo:   ['#FFD560', '#FF7A00', '#FF4500'] as const,
    gold:   ['#FFD560', '#FF7A00'] as const,
    card:   ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)'] as const,
    dare:   ['rgba(255,69,0,0.12)', 'rgba(255,45,90,0.06)'] as const,
    truth:  ['rgba(61,214,245,0.10)', 'rgba(61,214,245,0.04)'] as const,
    button: {
      truth: ['rgba(61,214,245,0.12)', 'rgba(61,214,245,0.04)'] as const,
      dare:  ['rgba(255,69,0,0.25)',   'rgba(255,45,90,0.12)'] as const,
      done:  ['#1a3a00', '#3D7000'] as const,
      skip:  ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)'] as const,
    },
  },
};
