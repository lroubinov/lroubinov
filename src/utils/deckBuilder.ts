import { Card, SpiceLevel } from '../data/types';
import { shuffleArray } from './shuffle';

export function buildDeck(levels: SpiceLevel[], truths: Card[], dares: Card[]): Card[] {
  const filtered = [...truths, ...dares].filter((c) => levels.includes(c.level));
  return shuffleArray(filtered);
}
