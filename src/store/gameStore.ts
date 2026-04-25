import { create } from 'zustand';
import { Card, CardType, ForfeitCard, GameConfig, GamePhase, GameState, Player, SpiceLevel } from '../data/types';
import { truths } from '../data/truths';
import { dares } from '../data/dares';
import { forfeits } from '../data/forfeits';
import { buildDeck } from '../utils/deckBuilder';
import { shuffleArray } from '../utils/shuffle';

interface SetupState {
  player1Name: string;
  player2Name: string;
  enabledLevels: SpiceLevel[];
}

interface GameStore extends SetupState {
  gameState: GameState | null;

  // Setup
  setPlayerNames: (p1: string, p2: string) => void;
  setEnabledLevels: (levels: SpiceLevel[]) => void;
  startGame: () => void;

  // In-game
  selectCardType: (type: CardType) => void;
  onRevealComplete: () => void;
  onTimerComplete: () => void;
  completeTurn: () => void;
  skipTurn: () => void;
  completeForfeit: () => void;
  resetGame: () => void;
}

function makePlayer(id: 1 | 2, name: string): Player {
  return { id, name, score: 0, forfeitsOwed: 0 };
}

function drawCard(deck: Card[], discardPile: Card[], levels: SpiceLevel[], type: CardType): { card: Card; deck: Card[]; discardPile: Card[] } {
  let available = deck.filter((c) => c.type === type);

  if (available.length === 0) {
    // Reshuffle discard pile back in (filtered by type)
    const recycled = shuffleArray(discardPile.filter((c) => c.type === type && levels.includes(c.level)));
    available = recycled;
    discardPile = discardPile.filter((c) => c.type !== type || !levels.includes(c.level));
    deck = [...deck.filter((c) => c.type !== type), ...recycled];
    if (available.length === 0) {
      // Fallback: rebuild from scratch
      const fresh = buildDeck(levels, truths, dares);
      available = fresh.filter((c) => c.type === type);
      deck = fresh;
      discardPile = [];
    }
  }

  const card = available[0];
  const newDeck = deck.filter((c) => c.id !== card.id);
  const newDiscard = [...discardPile, card];
  return { card, deck: newDeck, discardPile: newDiscard };
}

function pickForfeit(levels: SpiceLevel[]): ForfeitCard {
  const highestLevel: SpiceLevel = levels.includes('hardcore') ? 'hardcore' : levels.includes('scorching') ? 'scorching' : 'hot';
  const pool = forfeits.filter((f) => f.level === highestLevel);
  return pool[Math.floor(Math.random() * pool.length)];
}

export const useGameStore = create<GameStore>((set, get) => ({
  player1Name: '',
  player2Name: '',
  enabledLevels: ['hot'],
  gameState: null,

  setPlayerNames: (p1, p2) => set({ player1Name: p1, player2Name: p2 }),
  setEnabledLevels: (levels) => set({ enabledLevels: levels }),

  startGame: () => {
    const { player1Name, player2Name, enabledLevels } = get();
    const deck = buildDeck(enabledLevels, truths, dares);
    const config: GameConfig = {
      players: [makePlayer(1, player1Name), makePlayer(2, player2Name)],
      enabledLevels,
      totalRounds: 10,
    };
    const state: GameState = {
      config,
      deck,
      discardPile: [],
      currentPlayerIndex: 0,
      currentCard: null,
      phase: 'choosing',
      turnNumber: 1,
      pendingForfeit: null,
    };
    set({ gameState: state });
  },

  selectCardType: (type) => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'choosing') return;
    const { card, deck, discardPile } = drawCard(gs.deck, gs.discardPile, gs.config.enabledLevels, type);
    set({
      gameState: {
        ...gs,
        deck,
        discardPile,
        currentCard: card,
        phase: 'revealing',
      },
    });
  },

  onRevealComplete: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'revealing') return;
    const nextPhase: GamePhase = gs.currentCard?.type === 'dare' ? 'timer_running' : 'awaiting_done';
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
    players[gs.currentPlayerIndex] = {
      ...players[gs.currentPlayerIndex],
      score: players[gs.currentPlayerIndex].score + 1,
    };
    const nextIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
    const nextTurn = gs.turnNumber + 1;
    const gameOver = nextTurn > gs.config.totalRounds * 2;
    set({
      gameState: {
        ...gs,
        config: { ...gs.config, players },
        currentPlayerIndex: nextIndex,
        currentCard: null,
        phase: gameOver ? 'game_over' : 'choosing',
        turnNumber: nextTurn,
      },
    });
  },

  skipTurn: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'awaiting_done') return;
    const players = [...gs.config.players] as [Player, Player];
    players[gs.currentPlayerIndex] = {
      ...players[gs.currentPlayerIndex],
      forfeitsOwed: players[gs.currentPlayerIndex].forfeitsOwed + 1,
    };
    const forfeit = pickForfeit(gs.config.enabledLevels);
    set({
      gameState: {
        ...gs,
        config: { ...gs.config, players },
        pendingForfeit: forfeit,
        phase: 'forfeit',
      },
    });
  },

  completeForfeit: () => {
    const gs = get().gameState;
    if (!gs || gs.phase !== 'forfeit') return;
    const nextIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
    const nextTurn = gs.turnNumber + 1;
    const gameOver = nextTurn > gs.config.totalRounds * 2;
    set({
      gameState: {
        ...gs,
        currentPlayerIndex: nextIndex,
        currentCard: null,
        pendingForfeit: null,
        phase: gameOver ? 'game_over' : 'choosing',
        turnNumber: nextTurn,
      },
    });
  },

  resetGame: () => set({ gameState: null }),
}));
