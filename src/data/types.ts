import { Lang } from '../i18n';

export type SpiceLevel = 'hot' | 'scorching' | 'hardcore';
export type CardType   = 'truth' | 'dare';
export type GamePhase  =
  | 'choosing'
  | 'revealing'
  | 'timer_running'
  | 'awaiting_done'
  | 'forfeit'
  | 'game_over';

export type GameRounds = number | null; // null = unlimited

export interface Pack {
  id: string;
  name: string;
  emoji: string;
  lang: Lang;
}

export interface Card {
  id: string;
  type: CardType;
  level: SpiceLevel;
  text: string;
  lang?: Lang;         // undefined = built-in (any language)
  timerSeconds?: number;
  packId?: string;     // which pack this card belongs to
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

export interface HistoryEntry {
  turn: number;
  playerName: string;
  cardType: CardType;
  cardText: string;
  level: SpiceLevel;
  result: 'done' | 'skipped' | 'forfeit';
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
  history: HistoryEntry[];
}
