import type { CardColor } from './types';

export const CARD_COLORS: CardColor[] = ['black', 'white'];
export const NUM_PLAYERS = 4;

// 1人あたりの持ち枚数 → 最大数字
// 4人 * handSize / 2 = handSize * 2
export function getMaxNumber(handSize: number): number {
  return handSize * 2;
}

// 1 〜 maxN の配列
export function getCardNumbers(handSize: number): number[] {
  const maxN = getMaxNumber(handSize);
  return Array.from({ length: maxN }, (_, i) => i + 1);
}

// 同数字は黒 < 白
// black-1=0, white-1=1, black-2=2, white-2=3, ...
export function getCardOrdinal(number: number, color: CardColor): number {
  return (number - 1) * 2 + (color === 'white' ? 1 : 0);
}

export const CPU_THINK_DELAY = 3000;
export const CPU_RESULT_DELAY = 3600;

// 手札枚数の選択肢
export const HAND_SIZE_OPTIONS = [2, 3, 4, 5, 6] as const;
export const DEFAULT_HAND_SIZE = 4;

// 攻撃制限時間の選択肢（秒）0=制限なし
export const TIME_LIMIT_OPTIONS = [0, 10, 15, 20, 30, 60] as const;
export const DEFAULT_TIME_LIMIT = 20;

// 難易度
export const DIFFICULTY_LABELS = {
  easy:   { label: '初級', desc: 'ランダム',       emoji: '🌱' },
  medium: { label: '中級', desc: 'ログ分析あり',   emoji: '🌿' },
  hard:   { label: '上級', desc: '脱落狙い全力',   emoji: '🌳' },
} as const;

// 続けてアタックする確信度のしきい値
export const CONTINUE_THRESHOLD = {
  easy:   2.0,  // 絶対に続けない
  medium: 1.0,  // 100%確実なときだけ続ける
  hard:   0.6,  // 1〜2択のときに続ける
} as const;

// マッチ設定
export const TOTAL_ROUNDS = 4;
// ラウンドごとのスタートプレイヤー（0始まりのインデックス）
export const MATCH_START_ORDER: import('./types').PlayerId[] = ['human', 'cpu1', 'cpu2', 'cpu3'];
