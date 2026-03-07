'use client';

import { useGame } from '@/hooks/useGame';
import GameCard, { type AttackOverlay } from './GameCard';
import type { PlayerId } from '@/lib/types';

const CPU_ICONS: Record<string, string> = {
  cpu1: '🐱',
  cpu2: '🐶',
  cpu3: '🦔',
};

interface CpuAreaProps {
  playerId: PlayerId;
}

export default function CpuArea({ playerId }: CpuAreaProps) {
  const {
    players, phase, currentPlayer,
    selectedTargetPlayer, selectedTargetIndex, guessNumber,
    lastAttack, selectTarget,
  } = useGame();

  const player   = players[playerId];
  const isMyTurn = currentPlayer === playerId;

  // 相手カードを選べるのは select_target フェーズかつ人間のターン
  const canSelect = phase === 'select_target' && currentPlayer === 'human' && !player.isOut;

  return (
    <div
      className={`
        rounded-xl p-2.5 border-2 transition-all duration-300
        ${player.isOut ? 'opacity-40 border-gray-600' : ''}
        ${isMyTurn && !player.isOut ? 'border-yellow-400 shadow-[0_0_12px_rgba(255,213,79,0.4)] bg-black/30' : ''}
        ${!isMyTurn && !player.isOut ? 'border-white/15 bg-black/20' : ''}
      `}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-2xl">{player.isOut ? '💀' : CPU_ICONS[playerId] ?? '🤖'}</span>
        <span className="text-white font-bold text-xs">{player.name}</span>
        {isMyTurn && !player.isOut && (
          <span className="bg-yellow-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            ターン中
          </span>
        )}
        {player.isOut && (
          <span className="bg-gray-600 text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            脱落
          </span>
        )}
      </div>
      {/* 1列スクロール */}
      <div className="flex gap-1.5 overflow-x-auto pb-5">
        {player.hand.map((card, i) => {
          const isSelected = selectedTargetPlayer === playerId && selectedTargetIndex === i;

          // アタックオーバーレイの計算
          let overlay: AttackOverlay | null = null;
          if (selectedTargetPlayer === playerId && selectedTargetIndex === i && guessNumber !== null
              && (phase === 'cpu_thinking' || phase === 'declare')) {
            overlay = { guess: guessNumber, result: 'pending' };
          } else if (lastAttack?.targetPlayerId === playerId && lastAttack.targetIndex === i) {
            overlay = { guess: lastAttack.guessNumber, result: lastAttack.isHit ? 'hit' : 'miss' };
          }

          return (
            <div key={card.id} className="flex-shrink-0">
              <GameCard
                card={card}
                index={i}
                isOwner={false}
                isSelectable={canSelect && !card.isRevealed && !player.isOut}
                isSelected={isSelected}
                attackOverlay={overlay}
                onClick={() => selectTarget(playerId, i)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
