import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Lang } from '../i18n';
import {
  Card, CardType, ForfeitCard, GameConfig, GamePhase, GameRounds,
  GameState, HistoryEntry, Pack, Player, Prize, SpiceLevel,
} from '../data/types';
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
  packs: Pack[];
  disabledPackIds: string[];
  gameRounds: GameRounds;
  language: Lang;
  customPrizes: Prize[];
}

interface GameStore extends SetupState {
  gameState: GameState | null;
  setPlayerNames: (p1: string, p2: string) => void;
  setPlayerGenders: (g1: 'M' | 'F', g2: 'M' | 'F') => void;
  setEnabledLevels: (levels: SpiceLevel[]) => void;
  setGameRounds: (rounds: GameRounds) => void;
  setLanguage: (lang: Lang) => void;
  addCustomCard: (text: string, type: CardType, lang: Lang, timerSeconds?: number, packId?: string) => void;
  removeCustomCard: (id: string) => void;
  removeCustomCards: (ids: string[]) => void;
  addCustomCards: (cards: Card[]) => void;
  clearCustomCards: () => void;
  addPack: (name: string, emoji: string, lang: Lang) => string;
  removePack: (id: string) => void;
  togglePack: (id: string) => void;
  addPrize: (text: string, collaborative: boolean, lang: Lang) => void;
  addPrizes: (prizes: Prize[]) => void;
  removePrize: (id: string) => void;
  clearCustomPrizes: () => void;
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
  const idx = Math.floor(Math.random() * available.length);
  const card = available[idx];
  return { card, deck: deck.filter((c) => c.id !== card.id), discardPile: [...discardPile, card] };
}

function pickForfeit(levels: SpiceLevel[]): ForfeitCard {
  const highestLevel: SpiceLevel = levels.includes('hardcore') ? 'hardcore' : levels.includes('scorching') ? 'scorching' : 'hot';
  const pool = forfeits.filter((f) => f.level === highestLevel);
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeHistoryEntry(gs: GameState, result: HistoryEntry['result']): HistoryEntry | null {
  if (!gs.currentCard) return null;
  return {
    turn: gs.turnNumber,
    playerName: gs.config.players[gs.currentPlayerIndex].name,
    cardType: gs.currentCard.type,
    cardText: gs.currentCard.text,
    level: gs.currentCard.level,
    result,
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      player1Name: '', player2Name: '',
      player1Gender: 'M', player2Gender: 'F',
      enabledLevels: ['hot'], customCards: [],
      packs: [], disabledPackIds: [],
      gameRounds: 10, language: 'en', gameState: null,
      customPrizes: [],

      setPlayerNames:   (p1, p2) => set({ player1Name: p1, player2Name: p2 }),
      setPlayerGenders: (g1, g2) => set({ player1Gender: g1, player2Gender: g2 }),
      setEnabledLevels: (levels) => set({ enabledLevels: levels }),
      setGameRounds:    (rounds) => set({ gameRounds: rounds }),
      setLanguage:      (lang)   => set({ language: lang }),

      addCustomCard: (text, type, lang, timerSeconds, packId) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({ customCards: [...s.customCards, { id, type, level: 'hot', text, lang, timerSeconds, packId }] }));
      },
      removeCustomCard:  (id)  => set((s) => ({ customCards: s.customCards.filter((c) => c.id !== id) })),
      removeCustomCards: (ids) => set((s) => ({ customCards: s.customCards.filter((c) => !ids.includes(c.id)) })),
      addCustomCards:    (cards) => set((s) => ({ customCards: [...s.customCards, ...cards] })),
      clearCustomCards:  () => set({ customCards: [] }),

      addPack: (name, emoji, lang) => {
        const id = `pack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((s) => ({ packs: [...s.packs, { id, name, emoji, lang }] }));
        return id;
      },
      removePack: (id) => set((s) => ({
        packs: s.packs.filter((p) => p.id !== id),
        customCards: s.customCards.map((c) => c.packId === id ? { ...c, packId: undefined } : c),
        disabledPackIds: s.disabledPackIds.filter((pid) => pid !== id),
      })),
      togglePack: (id) => set((s) => ({
        disabledPackIds: s.disabledPackIds.includes(id)
          ? s.disabledPackIds.filter((pid) => pid !== id)
          : [...s.disabledPackIds, id],
      })),

      addPrize: (text, collaborative, lang) => {
        const id = `prize-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({ customPrizes: [...s.customPrizes, { id, text, collaborative, lang }] }));
      },
      addPrizes: (prizes) => set((s) => ({ customPrizes: [...s.customPrizes, ...prizes] })),
      removePrize: (id) => set((s) => ({ customPrizes: s.customPrizes.filter((p) => p.id !== id) })),
      clearCustomPrizes: () => set({ customPrizes: [] }),

      startGame: () => {
        const { player1Name, player2Name, player1Gender, player2Gender, enabledLevels, customCards, packs: _p, disabledPackIds, gameRounds, language } = get();
        const filteredCustom = customCards.filter((c) =>
          enabledLevels.includes(c.level) &&
          c.lang === language &&
          (!c.packId || !disabledPackIds.includes(c.packId))
        );
        const deck = shuffleArray([...buildDeck(enabledLevels, truths, dares), ...filteredCustom]);
        const config: GameConfig = {
          players: [makePlayer(1, player1Name, player1Gender), makePlayer(2, player2Name, player2Gender)],
          enabledLevels, totalRounds: gameRounds,
        };
        set({ gameState: { config, deck, discardPile: [], currentPlayerIndex: 0, currentCard: null, phase: 'choosing', turnNumber: 1, pendingForfeit: null, skipsRemaining: [MAX_SKIPS, MAX_SKIPS], history: [] } });
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
        const entry = makeHistoryEntry(gs, 'done');
        const history = entry ? [...gs.history, entry] : gs.history;
        const players = [...gs.config.players] as [Player, Player];
        players[gs.currentPlayerIndex] = { ...players[gs.currentPlayerIndex], score: players[gs.currentPlayerIndex].score + 1 };
        const nextIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
        const nextTurn = gs.turnNumber + 1;
        const gameOver = gs.config.totalRounds !== null && nextTurn > gs.config.totalRounds * 2;
        set({ gameState: { ...gs, config: { ...gs.config, players }, currentPlayerIndex: nextIndex, currentCard: null, phase: gameOver ? 'game_over' : 'choosing', turnNumber: nextTurn, history } });
      },

      skipTurn: () => {
        const gs = get().gameState;
        if (!gs || gs.phase !== 'awaiting_done') return;
        const playerSkips = gs.skipsRemaining[gs.currentPlayerIndex];
        if (playerSkips > 0) {
          const entry = makeHistoryEntry(gs, 'skipped');
          const history = entry ? [...gs.history, entry] : gs.history;
          const newSkips: [number, number] = [...gs.skipsRemaining] as [number, number];
          newSkips[gs.currentPlayerIndex] = playerSkips - 1;
          const nextIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
          const nextTurn = gs.turnNumber + 1;
          const gameOver = gs.config.totalRounds !== null && nextTurn > gs.config.totalRounds * 2;
          set({ gameState: { ...gs, skipsRemaining: newSkips, currentPlayerIndex: nextIndex, currentCard: null, phase: gameOver ? 'game_over' : 'choosing', turnNumber: nextTurn, history } });
        } else {
          const players = [...gs.config.players] as [Player, Player];
          players[gs.currentPlayerIndex] = { ...players[gs.currentPlayerIndex], forfeitsOwed: players[gs.currentPlayerIndex].forfeitsOwed + 1 };
          set({ gameState: { ...gs, config: { ...gs.config, players }, pendingForfeit: pickForfeit(gs.config.enabledLevels), phase: 'forfeit' } });
        }
      },

      completeForfeit: () => {
        const gs = get().gameState;
        if (!gs || gs.phase !== 'forfeit') return;
        const entry = makeHistoryEntry(gs, 'forfeit');
        const history = entry ? [...gs.history, entry] : gs.history;
        const nextIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
        const nextTurn = gs.turnNumber + 1;
        const gameOver = gs.config.totalRounds !== null && nextTurn > gs.config.totalRounds * 2;
        set({ gameState: { ...gs, currentPlayerIndex: nextIndex, currentCard: null, pendingForfeit: null, phase: gameOver ? 'game_over' : 'choosing', turnNumber: nextTurn, history } });
      },

      endGame: () => { const gs = get().gameState; if (!gs) return; set({ gameState: { ...gs, phase: 'game_over' } }); },
      resetGame: () => set({ gameState: null }),
    }),
    {
      name: 'ignite-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: any, version: number) => {
        if (version < 2) {
          if (persisted.gameState?.skipsRemaining !== undefined &&
              typeof persisted.gameState.skipsRemaining === 'number') {
            const n = persisted.gameState.skipsRemaining as number;
            persisted.gameState.skipsRemaining = [n, n] as [number, number];
          }
          if (!persisted.customPrizes) persisted.customPrizes = [];
        }
        return persisted;
      },
      partialize: (s) => ({
        player1Name:    s.player1Name,
        player2Name:    s.player2Name,
        player1Gender:  s.player1Gender,
        player2Gender:  s.player2Gender,
        enabledLevels:  s.enabledLevels,
        customCards:    s.customCards,
        packs:          s.packs,
        disabledPackIds: s.disabledPackIds,
        gameRounds:     s.gameRounds,
        language:       s.language,
        gameState:      s.gameState,
        customPrizes:   s.customPrizes,
      }),
    }
  )
);
