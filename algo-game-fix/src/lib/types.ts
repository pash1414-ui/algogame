export type CardColor = 'black' | 'white';

export interface Card {
  id: string;        // "black-7"
  number: number;    // 1〜maxN
  color: CardColor;
  isRevealed: boolean;
}

export type PlayerId = 'human' | 'cpu1' | 'cpu2' | 'cpu3';
export const ALL_PLAYER_IDS: PlayerId[] = ['human', 'cpu1', 'cpu2', 'cpu3'];

export interface Player {
  id: PlayerId;
  name: string;
  hand: Card[];
  isOut: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  handSize: number;    // 1人あたりの枚数 (2〜6)
  difficulty: Difficulty;
  timeLimit: number;   // 攻撃制限時間（秒）0=制限なし
}

// handSize * 4 / 2 = handSize * 2 が最大数字
// 例: handSize=4 → 1〜8

export type GamePhase =
  | 'idle'
  | 'select_attacker' // プレイヤーが自分の攻撃カードを選ぶ
  | 'select_target'   // プレイヤーが相手のカードを選ぶ
  | 'declare'         // アタック確認
  | 'cpu_thinking'    // CPU 処理中
  | 'result_hit'      // 正解 → 自動で続行
  | 'result_miss'     // はずれ → 自動遷移
  | 'game_over'
  | 'match_over';     // 全4ラウンド終了

export interface AttackRecord {
  id: string;
  turn: number;
  attackerId: PlayerId;
  targetPlayerId: PlayerId;
  targetCardIndex: number;
  guessNumber: number;
  guessColor: CardColor;
  isHit: boolean;
}

export interface LastAttack {
  targetPlayerId: PlayerId;
  targetIndex: number;
  guessNumber: number;
  isHit: boolean;
}

export interface GameState {
  config: GameConfig;
  phase: GamePhase;
  turn: number;
  matchRound: number;   // 現在のラウンド (1〜4)
  currentPlayer: PlayerId;
  players: Record<PlayerId, Player>;
  selectedAttackerIndex: number | null;
  selectedTargetPlayer: PlayerId | null;
  selectedTargetIndex: number | null;
  guessNumber: number | null;
  lastAttack: LastAttack | null; // 直前のアタック結果（カード上の表示用）
  log: AttackRecord[];
  winner: PlayerId | null;
  score: Record<PlayerId, number>;
}

export interface UIState {
  isDrawerOpen: boolean;
  activeTab: 'game' | 'rules' | 'log';
  message: string;
  timeRemaining: number | null; // カウントダウン残り秒（null=タイマーなし）
}
