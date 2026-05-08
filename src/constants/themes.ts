export type Theme = 'neon' | 'purple' | 'crimson' | 'ocean';

export interface ThemeDef {
  name: string;
  nameHe: string;
  emoji: string;
  gradient: readonly [string, string, string];
  cardGrad: readonly [string, string];
  primary: string;
  accent: string;
  gold: string;
}

export const THEMES: Record<Theme, ThemeDef> = {
  neon: {
    name: 'Neon Night',
    nameHe: 'ניאון',
    emoji: '🌙',
    gradient: ['#060410', '#0C0820', '#150030'] as const,
    cardGrad: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)'] as const,
    primary: '#FF4FA3',
    accent: '#3DD6F5',
    gold: '#FFD560',
  },
  purple: {
    name: 'Deep Purple',
    nameHe: 'סגול עמוק',
    emoji: '💜',
    gradient: ['#0D0018', '#1E0040', '#2D0060'] as const,
    cardGrad: ['rgba(168,85,247,0.12)', 'rgba(107,0,128,0.06)'] as const,
    primary: '#A855F7',
    accent: '#FFD560',
    gold: '#FFD560',
  },
  crimson: {
    name: 'Crimson Fire',
    nameHe: 'אש ארגמן',
    emoji: '🔥',
    gradient: ['#0A0000', '#200500', '#3D0000'] as const,
    cardGrad: ['rgba(255,69,0,0.12)', 'rgba(180,0,0,0.06)'] as const,
    primary: '#FF4500',
    accent: '#FF8500',
    gold: '#FFD560',
  },
  ocean: {
    name: 'Ocean Blue',
    nameHe: 'כחול ים',
    emoji: '🌊',
    gradient: ['#000A14', '#001428', '#002040'] as const,
    cardGrad: ['rgba(61,214,245,0.10)', 'rgba(0,60,120,0.06)'] as const,
    primary: '#3DD6F5',
    accent: '#00E5FF',
    gold: '#FFD560',
  },
};

export function getTheme(theme: Theme): ThemeDef {
  return THEMES[theme];
}
