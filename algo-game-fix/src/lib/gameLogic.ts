import type { Card, CardColor, Player, PlayerId } from './types';
import { ALL_PLAYER_IDS } from './types';
import { CARD_COLORS, getCardOrdinal, getCardNumbers, NUM_PLAYERS } from './constants';

// デッキ生成（1〜maxN の黒・白）
export function createDeck(handSize: number): Card[] {
  const deck: Card[] = [];
  const numbers = getCardNumbers(handSize);
  for (const color of CARD_COLORS) {
    for (const number of numbers) {
      deck.push({ id: `${color}-${number}`, number, color, isRevealed: false });
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort(
    (a, b) => getCardOrdinal(a.number, a.color) - getCardOrdinal(b.number, b.color)
  );
}

// 4人分にカードを配り切る（山札なし）
export function initializePlayers(handSize: number): Record<PlayerId, Player> {
  const shuffled = shuffle(createDeck(handSize));

  const playerNames: Record<PlayerId, string> = {
    human: 'あなた',
    cpu1:  'CPU 1',
    cpu2:  'CPU 2',
    cpu3:  'CPU 3',
  };

  const players = {} as Record<PlayerId, Player>;
  ALL_PLAYER_IDS.forEach((id, pi) => {
    const hand = shuffled.slice(pi * handSize, (pi + 1) * handSize);
    players[id] = {
      id,
      name: playerNames[id],
      hand: sortCards(hand),
      isOut: false,
    };
  });

  return players;
}

export function revealCard(hand: Card[], index: number): Card[] {
  return hand.map((c, i) => (i === index ? { ...c, isRevealed: true } : c));
}

export function checkAllRevealed(hand: Card[]): boolean {
  return hand.every((c) => c.isRevealed);
}

// はずれペナルティ: 最初の裏向きカードを表向きに
export function penaltyReveal(hand: Card[]): Card[] {
  const idx = hand.findIndex((c) => !c.isRevealed);
  if (idx === -1) return hand;
  return revealCard(hand, idx);
}

export function checkAttack(
  targetCard: Card,
  guessNumber: number,
  guessColor: CardColor
): boolean {
  return targetCard.number === guessNumber && targetCard.color === guessColor;
}

// 生きているプレイヤーのIDリスト
export function getAlivePlayers(players: Record<PlayerId, Player>): PlayerId[] {
  return ALL_PLAYER_IDS.filter((id) => !players[id].isOut);
}

// 次の生きているプレイヤー
export function getNextAlivePlayer(
  current: PlayerId,
  players: Record<PlayerId, Player>
): PlayerId {
  const idx = ALL_PLAYER_IDS.indexOf(current);
  for (let i = 1; i < ALL_PLAYER_IDS.length; i++) {
    const next = ALL_PLAYER_IDS[(idx + i) % ALL_PLAYER_IDS.length];
    if (!players[next].isOut) return next;
  }
  return current;
}
