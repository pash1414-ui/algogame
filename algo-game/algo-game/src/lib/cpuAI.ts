import type { Card, CardColor, GameState, PlayerId, Difficulty } from './types';
import { ALL_PLAYER_IDS } from './types';
import { CARD_COLORS, getCardOrdinal, getCardNumbers } from './constants';

export interface CpuDecision {
  attackerIndex: number;
  targetPlayerId: PlayerId;
  targetIndex: number;
  guessNumber: number;
  guessColor: CardColor;
  confidence: number;
}

export function decideCpuAction(
  state: GameState,
  cpuId: PlayerId,
  difficulty: Difficulty
): CpuDecision {
  switch (difficulty) {
    case 'easy':   return decideCpuEasy(state, cpuId);
    case 'medium': return decideCpuMedium(state, cpuId);
    case 'hard':   return decideCpuHard(state, cpuId);
  }
}

// ──────────────────────────────────────────
// 初級: ランダム。制約を一切無視
// ──────────────────────────────────────────
function decideCpuEasy(state: GameState, cpuId: PlayerId): CpuDecision {
  const myHidden = getMyHiddenCards(state, cpuId);
  const targets  = getAllHiddenTargets(state, cpuId);
  const numbers  = getCardNumbers(state.config.handSize);
  if (myHidden.length === 0 || targets.length === 0) return fallback(state, cpuId);

  const atkInfo = myHidden[Math.floor(Math.random() * myHidden.length)];
  const target  = targets[Math.floor(Math.random() * targets.length)];
  const tCard   = state.players[target.playerId].hand[target.cardIdx];
  const number  = numbers[Math.floor(Math.random() * numbers.length)];

  return {
    attackerIndex: atkInfo.index,
    targetPlayerId: target.playerId,
    targetIndex:    target.cardIdx,
    guessNumber:    number,
    guessColor:     tCard.color,
    confidence:     1 / numbers.length,
  };
}

// ──────────────────────────────────────────
// 中級: ログ活用 + 最小候補を必ず狙う + 自分カードも最適選択
// ──────────────────────────────────────────
function decideCpuMedium(state: GameState, cpuId: PlayerId): CpuDecision {
  const known    = buildKnownSet(state, cpuId);
  const logForbidden = buildForbiddenMap(state);
  const numbers  = getCardNumbers(state.config.handSize);
  const myHidden = getMyHiddenCards(state, cpuId);
  const targets  = getAllHiddenTargets(state, cpuId);
  if (myHidden.length === 0 || targets.length === 0) return fallback(state, cpuId);

  // 全ターゲットで候補数が最小のものを探す（ログで除外済みの番号も除く）
  let bestPossLen = Infinity;
  let bestTarget: { playerId: PlayerId; cardIdx: number; poss: Array<{ number: number; color: CardColor }> } | null = null;

  for (const { playerId, cardIdx } of targets) {
    const poss = getPossibilities(state.players[playerId].hand, cardIdx, known, numbers);
    const key = `${playerId}-${cardIdx}`;
    const forbidden = logForbidden.get(key) ?? new Set<string>();
    const filtered = poss.filter((p) => !forbidden.has(`${p.number}-${p.color}`));
    const effective = filtered.length > 0 ? filtered : poss;
    if (effective.length === 0) continue;
    if (effective.length < bestPossLen) {
      bestPossLen = effective.length;
      bestTarget = { playerId, cardIdx, poss: effective };
    }
  }

  if (!bestTarget) return decideCpuEasy(state, cpuId);

  const poss = bestTarget.poss;
  const pick = poss.length === 1
    ? poss[0]
    : poss[Math.floor(poss.length / 2)];

  const attackerInfo = chooseBestAttacker(state, cpuId, numbers);

  return {
    attackerIndex: attackerInfo,
    targetPlayerId: bestTarget.playerId,
    targetIndex:    bestTarget.cardIdx,
    guessNumber:    pick.number,
    guessColor:     pick.color,
    confidence:     1 / bestPossLen,
  };
}

// ──────────────────────────────────────────
// 上級: 脱落狙い最優先 + 確定ヒット優先 + ログ活用 + 攻撃カード最適選択
// ──────────────────────────────────────────
function decideCpuHard(state: GameState, cpuId: PlayerId): CpuDecision {
  const known    = buildKnownSet(state, cpuId);
  const logForbidden = buildForbiddenMap(state);
  const numbers  = getCardNumbers(state.config.handSize);
  const myHidden = getMyHiddenCards(state, cpuId);
  const targets  = getAllHiddenTargets(state, cpuId);
  if (myHidden.length === 0 || targets.length === 0) return fallback(state, cpuId);

  // 全ターゲットの実効候補を計算
  type TargetInfo = {
    playerId: PlayerId;
    cardIdx: number;
    poss: Array<{ number: number; color: CardColor }>;
    hiddenCount: number;
  };

  const targetInfos: TargetInfo[] = [];
  for (const { playerId, cardIdx } of targets) {
    const poss = getPossibilities(state.players[playerId].hand, cardIdx, known, numbers);
    const key = `${playerId}-${cardIdx}`;
    const forbidden = logForbidden.get(key) ?? new Set<string>();
    const filtered = poss.filter((p) => !forbidden.has(`${p.number}-${p.color}`));
    const effective = filtered.length > 0 ? filtered : poss;
    if (effective.length === 0) continue;
    const hiddenCount = state.players[playerId].hand.filter((c) => !c.isRevealed).length;
    targetInfos.push({ playerId, cardIdx, poss: effective, hiddenCount });
  }

  if (targetInfos.length === 0) return decideCpuMedium(state, cpuId);

  // 優先度1: 残り1枚のプレイヤーを確定ヒットで脱落させる
  const guaranteedElim = targetInfos.filter((t) => t.hiddenCount === 1 && t.poss.length === 1);
  // 優先度2: 確定ヒット（脱落とは限らない）
  const guaranteedHit = targetInfos.filter((t) => t.poss.length === 1);
  // 優先度3: 残り1枚のプレイヤーを狙う（外れても1択に絞り込める）
  const elimCandidates = targetInfos.filter((t) => t.hiddenCount === 1);

  let chosen: TargetInfo;
  if (guaranteedElim.length > 0) {
    chosen = guaranteedElim[0];
  } else if (guaranteedHit.length > 0) {
    // 確定ヒットが複数あれば残りカードが少ないプレイヤーを優先
    chosen = guaranteedHit.reduce((a, b) => a.hiddenCount <= b.hiddenCount ? a : b);
  } else if (elimCandidates.length > 0) {
    // 脱落狙い: 候補が最小のものを選ぶ
    chosen = elimCandidates.reduce((a, b) => a.poss.length <= b.poss.length ? a : b);
  } else {
    // 通常: 全体で候補最小
    chosen = targetInfos.reduce((a, b) => a.poss.length <= b.poss.length ? a : b);
  }

  // 数字選択: 候補が1つなら確定。複数なら中央値（範囲の中心が最も可能性が高い）
  const poss = chosen.poss;
  const pick = poss.length === 1
    ? poss[0]
    : poss[Math.floor(poss.length / 2)];

  // 攻撃カード選択: 相手から最もバレにくいカード（候補が多い = 値を絞られにくい）を温存し
  // 最もバレやすいカードを犠牲にする
  const attackerInfo = chooseBestAttacker(state, cpuId, numbers);

  return {
    attackerIndex: attackerInfo,
    targetPlayerId: chosen.playerId,
    targetIndex:    chosen.cardIdx,
    guessNumber:    pick.number,
    guessColor:     pick.color,
    confidence:     1 / poss.length,
  };
}

// ──────────────────────────────────────────
// 共通ヘルパー
// ──────────────────────────────────────────

/** 対戦相手から見て一番見当がつきやすい（候補が少ない）自分カードを選ぶ */
function chooseBestAttacker(state: GameState, cpuId: PlayerId, numbers: number[]): number {
  const myHidden = getMyHiddenCards(state, cpuId);
  if (myHidden.length === 0) return 0;

  // 相手視点のknownSet（自分の隠しカードを含めない）
  const opponentKnown = new Set<string>();
  for (const id of ALL_PLAYER_IDS) {
    for (const c of state.players[id].hand) {
      if (c.isRevealed) opponentKnown.add(`${c.number}-${c.color}`);
    }
  }

  // 相手から見て候補数が最も少ない（＝最もバレやすい）カードを犠牲に選ぶ
  let minPoss = Infinity;
  let bestIdx = myHidden[0].index;
  for (const { index } of myHidden) {
    const poss = getPossibilities(state.players[cpuId].hand, index, opponentKnown, numbers);
    if (poss.length < minPoss) {
      minPoss = poss.length;
      bestIdx = index;
    }
  }
  return bestIdx;
}

/** ログからはずれだった（playerId-cardIdx → forbidden "number-color"）マップを作る */
function buildForbiddenMap(state: GameState): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const record of state.log) {
    if (!record.isHit) {
      const key = `${record.targetPlayerId}-${record.targetCardIndex}`;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(`${record.guessNumber}-${record.guessColor}`);
    }
  }
  return map;
}

function getMyHiddenCards(state: GameState, cpuId: PlayerId): Array<{ index: number; card: Card }> {
  return state.players[cpuId].hand
    .map((c, i) => ({ index: i, card: c }))
    .filter(({ card }) => !card.isRevealed);
}

function getAllHiddenTargets(state: GameState, cpuId: PlayerId) {
  const targets: { playerId: PlayerId; cardIdx: number }[] = [];
  for (const id of ALL_PLAYER_IDS) {
    if (id === cpuId || state.players[id].isOut) continue;
    state.players[id].hand.forEach((c, i) => {
      if (!c.isRevealed) targets.push({ playerId: id, cardIdx: i });
    });
  }
  return targets;
}

function getPossibilities(
  hand: Card[],
  targetIndex: number,
  known: Set<string>,
  numbers: number[]
): Array<{ number: number; color: CardColor }> {
  let lower: Card | null = null;
  let upper: Card | null = null;
  for (let i = targetIndex - 1; i >= 0; i--) {
    if (hand[i].isRevealed) { lower = hand[i]; break; }
  }
  for (let i = targetIndex + 1; i < hand.length; i++) {
    if (hand[i].isRevealed) { upper = hand[i]; break; }
  }
  const result: Array<{ number: number; color: CardColor }> = [];
  for (const number of numbers) {
    for (const color of CARD_COLORS) {
      const ord = getCardOrdinal(number, color);
      if (lower && ord <= getCardOrdinal(lower.number, lower.color)) continue;
      if (upper && ord >= getCardOrdinal(upper.number, upper.color)) continue;
      if (known.has(`${number}-${color}`)) continue;
      result.push({ number, color });
    }
  }
  return result;
}

function buildKnownSet(state: GameState, attackerId: PlayerId): Set<string> {
  const known = new Set<string>();
  for (const c of state.players[attackerId].hand) known.add(`${c.number}-${c.color}`);
  for (const id of ALL_PLAYER_IDS) {
    for (const c of state.players[id].hand) {
      if (c.isRevealed) known.add(`${c.number}-${c.color}`);
    }
  }
  return known;
}

function fallback(state: GameState, cpuId: PlayerId): CpuDecision {
  const myHidden = getMyHiddenCards(state, cpuId);
  const attackerIndex = myHidden.length > 0 ? myHidden[0].index : 0;
  const attackerCard  = state.players[cpuId].hand[attackerIndex];
  const numbers = getCardNumbers(state.config.handSize);
  return {
    attackerIndex,
    targetPlayerId: 'human',
    targetIndex:    0,
    guessNumber:    numbers[0],
    guessColor:     attackerCard?.color ?? 'black',
    confidence:     0.1,
  };
}
