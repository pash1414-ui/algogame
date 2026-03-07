'use client';

import { create } from 'zustand';
import type { GameState, UIState, AttackRecord, PlayerId, GameConfig, Difficulty, LastAttack } from '@/lib/types';
import { ALL_PLAYER_IDS } from '@/lib/types';
import {
  initializePlayers,
  checkAttack,
  revealCard,
  checkAllRevealed,
  getAlivePlayers,
  getNextAlivePlayer,
} from '@/lib/gameLogic';
import { decideCpuAction } from '@/lib/cpuAI';
import { CPU_THINK_DELAY, CPU_RESULT_DELAY, DEFAULT_HAND_SIZE, DEFAULT_TIME_LIMIT, TOTAL_ROUNDS, MATCH_START_ORDER } from '@/lib/constants';

interface AlgoStore extends GameState, UIState {
  // 設定
  setHandSize: (n: number) => void;
  setDifficulty: (d: Difficulty) => void;
  setTimeLimit: (t: number) => void;
  // ゲーム操作
  startMatch: () => void;       // 新しいマッチを開始（スコアリセット）
  startNextRound: () => void;   // 次のラウンドを開始
  selectAttacker: (cardIndex: number) => void;
  selectTarget: (playerId: PlayerId, cardIndex: number) => void;
  setGuessNumber: (n: number) => void;
  confirmAttack: () => void;
  cancelAttack: () => void;
  _executeCpuTurn: (cpuId: PlayerId) => void;
  // UI
  toggleDrawer: () => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
}

const initUI = (): UIState => ({
  isDrawerOpen: false,
  activeTab: 'game',
  message: 'スタートボタンを押してゲームを始めよう！',
  timeRemaining: null,
});

const defaultConfig: GameConfig = { handSize: DEFAULT_HAND_SIZE, difficulty: 'medium', timeLimit: DEFAULT_TIME_LIMIT };

// ─────────────────────────────
// モジュールレベルのタイマー管理
let _timerInterval: ReturnType<typeof setInterval> | null = null;

function _clearTimer() {
  if (_timerInterval !== null) {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }
}

function _startTimer(
  get: () => AlgoStore,
  set: (partial: Partial<AlgoStore>) => void
) {
  _clearTimer();
  const { config } = get();
  if (!config.timeLimit) return;

  set({ timeRemaining: config.timeLimit });

  _timerInterval = setInterval(() => {
    const s = get();
    const isHumanTurn = ['select_target', 'declare'].includes(s.phase) && s.currentPlayer === 'human';
    if (!isHumanTurn) {
      _clearTimer();
      set({ timeRemaining: null });
      return;
    }
    const next = (s.timeRemaining ?? 0) - 1;
    if (next <= 0) {
      _clearTimer();
      set({ timeRemaining: 0, message: '⏰ 時間切れ！ターンを終了します' });
      setTimeout(() => _advanceTurn(get, set), 800);
    } else {
      set({ timeRemaining: next });
    }
  }, 1000);
}

// ラウンドを初期化して開始（スコアはそのまま）
function _initRound(
  get: () => AlgoStore,
  set: (partial: Partial<AlgoStore>) => void,
  matchRound: number
) {
  _clearTimer();
  const { config } = get();
  const players = initializePlayers(config.handSize);
  const startPlayer = MATCH_START_ORDER[(matchRound - 1) % TOTAL_ROUNDS];
  const isHumanFirst = startPlayer === 'human';

  set({
    phase: isHumanFirst ? 'select_attacker' : 'cpu_thinking',
    turn: 1,
    matchRound,
    currentPlayer: startPlayer,
    players,
    selectedAttackerIndex: null,
    selectedTargetPlayer: null,
    selectedTargetIndex: null,
    guessNumber: null,
    lastAttack: null,
    log: [],
    winner: null,
    activeTab: 'game',
    timeRemaining: null,
    message: isHumanFirst
      ? `ラウンド ${matchRound}／${TOTAL_ROUNDS}　あなたがスタート！カードを選んでください`
      : `ラウンド ${matchRound}／${TOTAL_ROUNDS}　${players[startPlayer].name} がスタート！`,
  });

  if (!isHumanFirst) {
    setTimeout(() => {
      if (get().phase !== 'game_over' && get().phase !== 'match_over') {
        get()._executeCpuTurn(startPlayer);
      }
    }, CPU_THINK_DELAY);
  }
}

export const useAlgoStore = create<AlgoStore>()((set, get) => ({
  // 初期ゲーム状態
  config: defaultConfig,
  phase: 'idle',
  turn: 1,
  matchRound: 1,
  currentPlayer: 'human' as PlayerId,
  players: {
    human: { id: 'human', name: 'あなた', hand: [], isOut: false },
    cpu1:  { id: 'cpu1',  name: 'CPU 1', hand: [], isOut: false },
    cpu2:  { id: 'cpu2',  name: 'CPU 2', hand: [], isOut: false },
    cpu3:  { id: 'cpu3',  name: 'CPU 3', hand: [], isOut: false },
  },
  selectedAttackerIndex: null,
  selectedTargetPlayer: null,
  selectedTargetIndex: null,
  guessNumber: null,
  lastAttack: null,
  log: [],
  winner: null,
  score: { human: 0, cpu1: 0, cpu2: 0, cpu3: 0 },
  ...initUI(),

  // ─────────────────────────────
  setHandSize: (n: number) => {
    set((s) => ({ config: { ...s.config, handSize: n } }));
  },

  setDifficulty: (d: Difficulty) => {
    set((s) => ({ config: { ...s.config, difficulty: d } }));
  },

  setTimeLimit: (t: number) => {
    set((s) => ({ config: { ...s.config, timeLimit: t } }));
  },

  // 新しいマッチを開始（スコアをリセット）
  startMatch: () => {
    set({ score: { human: 0, cpu1: 0, cpu2: 0, cpu3: 0 } });
    _initRound(get, set, 1);
  },

  // 次のラウンドを開始
  startNextRound: () => {
    const { matchRound } = get();
    _initRound(get, set, matchRound + 1);
  },

  // ─────────────────────────────
  selectAttacker: (cardIndex: number) => {
    const { phase, currentPlayer, players } = get();
    if (phase !== 'select_attacker' && phase !== 'select_target') return;
    if (currentPlayer !== 'human') return;
    const attackerCard = players.human.hand[cardIndex];
    if (!attackerCard || attackerCard.isRevealed) return;

    const colorLabel = attackerCard.color === 'black' ? '⚫ クロ' : '⚪ シロ';
    const isFirstSelection = phase === 'select_attacker';
    set({
      selectedAttackerIndex: cardIndex,
      guessNumber: null,
      selectedTargetPlayer: null,
      selectedTargetIndex: null,
      phase: 'select_target',
      message: `${colorLabel}の${attackerCard.number}を攻撃カードに選択！相手のカードをクリックして狙いを定めてください`,
    });
    // 最初にカードを選んだ瞬間からタイマースタート（選びなおしはリセットしない）
    if (isFirstSelection) _startTimer(get, set);
  },

  // ─────────────────────────────
  selectTarget: (playerId: PlayerId, cardIndex: number) => {
    const { phase, currentPlayer, players } = get();
    if (phase !== 'select_target' || currentPlayer !== 'human') return;
    if (players[playerId].isOut) return;
    const targetCard = players[playerId].hand[cardIndex];
    if (!targetCard || targetCard.isRevealed) return;

    set({
      selectedTargetPlayer: playerId,
      selectedTargetIndex: cardIndex,
      phase: 'declare',
      message: `${players[playerId].name} の ${cardIndex + 1}番目を狙う！準備ができたらアタック！`,
    });
  },

  // ─────────────────────────────
  setGuessNumber: (n: number) => {
    set({ guessNumber: n });
  },

  // ─────────────────────────────
  confirmAttack: () => {
    const {
      selectedAttackerIndex,
      selectedTargetPlayer,
      selectedTargetIndex,
      guessNumber,
      players,
      currentPlayer,
      turn,
      score,
      matchRound,
    } = get();
    if (selectedAttackerIndex === null || !selectedTargetPlayer || selectedTargetIndex === null || guessNumber === null) return;

    if (currentPlayer === 'human') _clearTimer();

    const attackerId = currentPlayer;
    const defenderId = selectedTargetPlayer;
    const targetCard = players[defenderId].hand[selectedTargetIndex];
    const isHit = checkAttack(targetCard, guessNumber, targetCard.color);

    const record: AttackRecord = {
      id: crypto.randomUUID(),
      turn,
      attackerId,
      targetPlayerId: defenderId,
      targetCardIndex: selectedTargetIndex,
      guessNumber,
      guessColor: targetCard.color,
      isHit,
    };

    if (isHit) {
      const newDefHand = revealCard(players[defenderId].hand, selectedTargetIndex);
      let newPlayers = {
        ...players,
        [defenderId]: { ...players[defenderId], hand: newDefHand },
      };

      if (checkAllRevealed(newDefHand)) {
        newPlayers = {
          ...newPlayers,
          [defenderId]: { ...newPlayers[defenderId], isOut: true },
        };
      }

      const alive = getAlivePlayers(newPlayers);
      if (alive.length <= 1) {
        const winnerId = alive[0] ?? attackerId;
        const newScore = { ...score, [winnerId]: score[winnerId] + 1 };
        const isMatchOver = matchRound >= TOTAL_ROUNDS;

        set({
          players: newPlayers,
          log: [record, ...get().log],
          phase: isMatchOver ? 'match_over' : 'game_over',
          winner: winnerId,
          timeRemaining: null,
          score: newScore,
          message: isMatchOver
            ? `ラウンド ${matchRound} 終了！全${TOTAL_ROUNDS}ラウンド完了！`
            : `ラウンド ${matchRound} 終了！`,
        });
        return;
      }

      const defPlayerName = players[defenderId].name;
      const hitRecord: LastAttack = { targetPlayerId: defenderId, targetIndex: selectedTargetIndex, guessNumber, isHit: true };
      set({
        players: newPlayers,
        log: [record, ...get().log],
        phase: 'result_hit',
        lastAttack: hitRecord,
        selectedAttackerIndex: attackerId === 'human' ? selectedAttackerIndex : null,
        selectedTargetPlayer: null,
        selectedTargetIndex: null,
        guessNumber: null,
        timeRemaining: null,
        message:
          attackerId === 'human'
            ? `正解！${newPlayers[defenderId].isOut ? defPlayerName + ' を脱落させました！' : ''} 続けてアタックします！`
            : `${players[attackerId].name} が正解！${newPlayers[defenderId].isOut ? defPlayerName + ' 脱落！' : ''}`,
      });

      if (attackerId === 'human') {
        setTimeout(() => {
          const s = get();
          if (s.phase === 'game_over' || s.phase === 'match_over') return;
          if (s.phase === 'result_hit' && s.currentPlayer === 'human') {
            const attackerCard = s.players.human.hand[selectedAttackerIndex];
            const colorLabel = attackerCard?.color === 'black' ? '⚫ クロ' : '⚪ シロ';
            set({
              phase: 'select_target',
              message: `${colorLabel}の${attackerCard?.number}で続けてアタック！相手のカードを選んでください`,
            });
            _startTimer(get, set);
          }
        }, 1800);
      }

    } else {
      const newAtkHand = revealCard(players[attackerId].hand, selectedAttackerIndex);
      let newPlayers = {
        ...players,
        [attackerId]: { ...players[attackerId], hand: newAtkHand },
      };

      if (checkAllRevealed(newAtkHand)) {
        newPlayers = {
          ...newPlayers,
          [attackerId]: { ...newPlayers[attackerId], isOut: true },
        };
      }

      const alive = getAlivePlayers(newPlayers);
      if (alive.length <= 1) {
        const winnerId = alive[0] ?? defenderId;
        const newScore = { ...score, [winnerId]: score[winnerId] + 1 };
        const isMatchOver = matchRound >= TOTAL_ROUNDS;

        set({
          players: newPlayers,
          log: [record, ...get().log],
          phase: isMatchOver ? 'match_over' : 'game_over',
          winner: winnerId,
          timeRemaining: null,
          score: newScore,
          message: isMatchOver
            ? `ラウンド ${matchRound} 終了！全${TOTAL_ROUNDS}ラウンド完了！`
            : `ラウンド ${matchRound} 終了！`,
        });
        return;
      }

      const missRecord: LastAttack = { targetPlayerId: defenderId, targetIndex: selectedTargetIndex, guessNumber, isHit: false };
      set({
        players: newPlayers,
        log: [record, ...get().log],
        phase: 'result_miss',
        lastAttack: missRecord,
        selectedAttackerIndex: null,
        selectedTargetPlayer: null,
        selectedTargetIndex: null,
        guessNumber: null,
        timeRemaining: null,
        message:
          attackerId === 'human'
            ? 'はずれ… 攻撃カードが1枚めくれました。次のプレイヤーへ。'
            : `${players[attackerId].name} がはずれ！`,
      });

      if (attackerId === 'human') {
        setTimeout(() => {
          const s = get();
          if (s.phase !== 'result_miss') return;
          _advanceTurn(get, set);
        }, 4000);
      }
    }
  },

  // ─────────────────────────────
  cancelAttack: () => {
    const { phase } = get();
    if (phase === 'declare') {
      set({
        phase: 'select_target',
        selectedTargetPlayer: null,
        selectedTargetIndex: null,
        message: '相手の同じ色のカードをクリックして狙いを定めてください',
      });
    } else {
      set({
        phase: 'select_attacker',
        selectedAttackerIndex: null,
        selectedTargetPlayer: null,
        selectedTargetIndex: null,
        guessNumber: null,
        message: '自分のカードをクリックして攻撃カードを選んでください',
      });
    }
  },

  // ─────────────────────────────
  _executeCpuTurn: (cpuId: PlayerId) => {
    _executeCpuSingleAttack(get, set, cpuId);
  },

  // ─────────────────────────────
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// ─────────────────────────────
function _executeCpuSingleAttack(
  get: () => AlgoStore,
  set: (partial: Partial<AlgoStore>) => void,
  cpuId: PlayerId
) {
  const s = get();
  if (s.phase === 'game_over' || s.phase === 'match_over') return;

  const hasTarget = ALL_PLAYER_IDS.some(
    (id) => id !== cpuId && !s.players[id].isOut && s.players[id].hand.some((c) => !c.isRevealed)
  );
  const hasAttacker = s.players[cpuId].hand.some((c) => !c.isRevealed);

  if (!hasTarget || !hasAttacker) {
    _advanceTurn(get, set);
    return;
  }

  const decision = decideCpuAction(s, cpuId, s.config.difficulty);
  const tc = s.players[decision.targetPlayerId]?.hand[decision.targetIndex];
  if (!tc) { _advanceTurn(get, set); return; }

  set({
    selectedAttackerIndex: decision.attackerIndex,
    selectedTargetPlayer: decision.targetPlayerId,
    selectedTargetIndex: decision.targetIndex,
    guessNumber: decision.guessNumber,
    lastAttack: null,
    phase: 'cpu_thinking',
    message: `${s.players[cpuId].name} のアタック！`,
  });

  setTimeout(() => {
    get().confirmAttack();

    setTimeout(() => {
      const s2 = get();
      if (s2.phase === 'game_over' || s2.phase === 'match_over') return;

      if (s2.phase === 'result_hit') {
        set({ message: `${s2.players[cpuId].name} が続けてアタック！` });
        setTimeout(() => {
          const s3 = get();
          if (s3.phase !== 'game_over' && s3.phase !== 'match_over') {
            _executeCpuSingleAttack(get, set, cpuId);
          }
        }, 2400);
      } else if (s2.phase === 'result_miss') {
        setTimeout(() => {
          const s3 = get();
          if (s3.phase !== 'game_over' && s3.phase !== 'match_over') _advanceTurn(get, set);
        }, 3000);
      }
    }, CPU_RESULT_DELAY);
  }, CPU_THINK_DELAY);
}

// ターンを次のプレイヤーへ進める
function _advanceTurn(
  get: () => AlgoStore,
  set: (partial: Partial<AlgoStore>) => void
) {
  const { currentPlayer, players, turn, phase } = get();
  if (phase === 'game_over' || phase === 'match_over') return;

  _clearTimer();

  const next = getNextAlivePlayer(currentPlayer, players);
  const isHumanNext = next === 'human';

  set({
    currentPlayer: next,
    turn: turn + 1,
    phase: isHumanNext ? 'select_attacker' : 'cpu_thinking',
    selectedAttackerIndex: null,
    selectedTargetPlayer: null,
    selectedTargetIndex: null,
    guessNumber: null,
    lastAttack: null,
    timeRemaining: null,
    message: isHumanNext
      ? 'あなたのターンです！自分のカードをクリックして攻撃カードを選んでください'
      : `${players[next].name} のターンです…`,
  });

  if (!isHumanNext) {
    setTimeout(() => {
      if (get().phase !== 'game_over' && get().phase !== 'match_over') {
        get()._executeCpuTurn(next);
      }
    }, CPU_THINK_DELAY);
  }
}
