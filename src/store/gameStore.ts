import { create } from 'zustand';
import { Lang } from '../i18n';
import { Card, CardType, ForfeitCard, GameConfig, GamePhase, GameRounds, GameState, Player, SpiceLevel } from '../data/types';
import { truths } from '../data/truths';
import { dares } from '../data/dares';
import { forfeits } from '../data/forfeits';
import { buildDeck } from '../utils/deckBuilder';
import { shuffleArray } from '../utils/shuffle';

const MAX_SKIPS = 3;

interface SetupState {
  player1Name: string;
  player2Name: string;
  player1Gender: 'M' | 'F';
  player2Gender: 'M' | 'F';
  enabledLevels: SpiceLevel[];
  customCards: Card[];
  gameRounds: GameRounds;
  language: Lang;
}

interface GameStore extends SetupState {
  gameState: GameState | null;
  setPlayerNames: (p1: string, p2: string) => void;
  setPlayerGenders: (g1: 'M' | 'F', g2: 'M' | 'F') => void;
  setEnabledLevels: (levels: SpiceLevel[]) => void;
  setGameRounds: (rounds: GameRounds) => void;
  setLanguage: (lang: Lang) => void;
  addCustomCard: (text: string, type: CardType, lang: Lang) => void;
  removeCustomCard: (id: string) => void;
  removeCustomCards: (ids: string[]) => void;
  addCustomCards: (cards: Card[]) => void;
  clearCustomCards: () => void;
  startGame: () => void;
  selectCardType: (type: CardType) => void;
  onRevealComplete: () => void;
  onTimerComplete: () => void;
  completeTurn: () => void;
  skipTurn: () => void;
  completeForfeit: () => void;
  endGame: () => void;
  resetGame: () => void;
}

function makePlayer(id: 1 | 2, name: string, gender: 'M' | 'F'): Player {
  return { id, name, gender, score: 0, forfeitsOwed: 0 };
}

function drawCard(deck: Card[], discardPile: Card[], levels: SpiceLevel[], type: CardType): { card: Card; deck: Card[]; discardPile: Card[] } {
  let available = deck.filter((c) => c.type === type);
  if (available.length === 0) {
    const recycled = shuffleArray(discardPile.filter((c) => c.type === type && levels.includes(c.level)));
    available = recycled;
    discardPile = discardPile.filter((c) => c.type !== type || !levels.includes(c.level));
    deck = [...deck.filter((c) => c.type !== type), ...recycled];
    if (available.length === 0) {
      const fresh = buildDeck(levels, truths, dares);
      available = fresh.filter((c) => c.type === type);
      deck = fresh;
      discardPile = [];
    }
  }
  // Pick a random card from available (extra randomness on top of pre-shuffled deck)
  const idx = Math.floor(Math.random() * available.length);
  const card = available[idx];
  return { card, deck: deck.filter((c) => c.id !== card.id), discardPile: [...discardPile, card] };
}

function pickForfeit(levels: SpiceLevel[]): ForfeitCard {
  const highestLevel: SpiceLevel = levels.includes('hardcore') ? 'hardcore' : levels.includes('scorching') ? 'scorching' : 'hot';
  const pool = forfeits.filter((f) => f.level === highestLevel);
  return pool[Math.floor(Math.random() * pool.length)];
}

export const useGameStore = create<GameStore>((set, get) => ({
  player1Name: '', player2Name: '',
  player1Gender: 'M', player2Gender: 'F',
  enabledLevels: ['hot'], customCards: [], gameRounds: 10, language: 'en', gameState: null,

  setPlayerNames: (p1, p2) => set({ player1Name: p1, player2Name: p2 }),
  setPlayerGenders: (g1, g2) => set({ player1Gender: g1, player2Gender: g2 }),
  setEnabledLevels: (levels) => set({ enabledLevels: levels }),
  setGameRounds: (rounds) => set({ gameRounds: rounds }),
  setLanguage: (lang) => set({ language: lang }),

  addCustomCard: (text, type, lang) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ customCards: [...s.customCards, { id, type, level: 'hot', text, lang }] }));
  },
  removeCustomCard: (id) => set((s) => ({ customCards: s.customCards.filter((c) => c.id !== id) })),
  removeCustomCards: (ids) => set((s) => ({ customCards: s.customCards.filter((c) => !ids.includes(c.id)) })),
  addCustomCards: (cards) => set((s) => ({ customCards: [...s.customCards, ...cards] })),
  clearCustomCards: () => set({ customCards: [] }),

  startGame: () => {
    const { player1Name, player2Name, player1Gender, player2Gender, enabledLevels, customCards, gameRounds, language } = get();
    const filteredCustom = customCards.filter(
      (c) => enabledLevels.includes(c.level) && c.lang === language
    );
    // Shuffle built-in + custom together for true randomness
    const deck = shuffleArray([...buildDeck(enabledLevels, truths, dares), ...filteredCustom]);
    const config: GameConfig = {
      players: [makePlayer(1, player1Name, player1Gender), makePlayer(2, player2Name, player2Gender)],
      enabledLevels, totalRounds: gameRounds,
    };
    set({ gameState: { config, deck, discardPile: [], currentPlayerIndex: 0, currentCard: null, phase: 'choosing', turnNumber: 1, pendingForfeit: null, skipsRemaining: MAX_SKIPS } });
  },

  selectCardType: (type) => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'choosing') return;
    const { card, deck, discardPile } = drawCard(gs.deck, gs.discardPile, gs.config.enabledLevels, type);
    set({ gameState: { ...gs, deck, discardPile, currentCard: card, phase: 'revealing' } });
  },

  onRevealComplete: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'revealing') return;
    const nextPhase: GamePhase = gs.currentCard?.type === 'dare' && gs.currentCard?.timerSeconds ? 'timer_running' : 'awaiting_done';
    set({ gameState: { ...gs, phase: nextPhase } });
  },

  onTimerComplete: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'timer_running') return;
    set({ gameState: { ...gs, phase: 'awaiting_done' } });
  },

  completeTurn: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'awaiting_done') return;
    const players = [...gs.config.players] as [Player, Player];
    players[gs.currentPlayerIndex] = { ...players[gs.currentPlayerIndex], score: players[gs.currentPlayerIndex].score + 1 };
    const nextIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
    const nextTurn = gs.turnNumber + 1;
    const gameOver = gs.config.totalRounds !== null && nextTurn > gs.config.totalRounds * 2;
    set({ gameState: { ...gs, config: { ...gs.config, players }, currentPlayerIndex: nextIndex, currentCard: null, phase: gameOver ? 'game_over' : 'choosing', turnNumber: nextTurn } });
  },

  skipTurn: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'awaiting_done') return;
    if (gs.skipsRemaining > 0) {
      set({ gameState: { ...gs, skipsRemaining: gs.skipsRemaining - 1, currentCard: null, phase: 'choosing' } });
    } else {
      const players = [...gs.config.players] as [Player, Player];
      players[gs.currentPlayerIndex] = { ...players[gs.currentPlayerIndex], forfeitsOwed: players[gs.currentPlayerIndex].forfeitsOwed + 1 };
      set({ gameState: { ...gs, config: { ...gs.config, players }, pendingForfeit: pickForfeit(gs.config.enabledLevels), phase: 'forfeit' } });
    }
  },

  completeForfeit: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'forfeit') return;
    const nextIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
    const nextTurn = gs.turnNumber + 1;
    const gameOver = gs.config.totalRounds !== null && nextTurn > gs.config.totalRounds * 2;
    set({ gameState: { ...gs, currentPlayerIndex: nextIndex, currentCard: null, pendingForfeit: null, phase: gameOver ? 'game_over' : 'choosing', turnNumber: nextTurn } });
  },

  endGame: () => { const gs = get().gameState; if (!gs) return; set({ gameState: { ...gs, phase: 'game_over' } }); },
  resetGame: () => set({ gameState: null }),
}));
