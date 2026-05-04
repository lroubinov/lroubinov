import { Lang } from '../i18n';

export type SpiceLevel = 'hot' | 'scorching' | 'hardcore';

export type CardType = 'truth' | 'dare';

export type GamePhase =
  | 'choosing'
  | 'revealing'
  | 'timer_running'
  | 'awaiting_done'
  | 'forfeit'
  | 'game_over';

export type GameRounds = number | null; // null = unlimited

export interface Card {
  id: string;
  type: CardType;
  level: SpiceLevel;
  text: string;
  lang?: Lang; // undefined = built-in (any language), set = language-specific custom card
  timerSeconds?: number;
}

export interface ForfeitCard {
  id: string;
  level: SpiceLevel;
  text: string;
}

export interface Player {
  id: 1 | 2;
  name: string;
  gender: 'M' | 'F';
  score: number;
  forfeitsOwed: number;
}

export interface GameConfig {
  players: [Player, Player];
  enabledLevels: SpiceLevel[];
  totalRounds: number | null;
}

export interface GameState {
  config: GameConfig;
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: 0 | 1;
  currentCard: Card | null;
  phase: GamePhase;
  turnNumber: number;
  pendingForfeit: ForfeitCard | null;
  skipsRemaining: number;
}
