'use client';

import { useGame } from '@/hooks/useGame';
import GameCard, { type AttackOverlay } from './GameCard';

export default function PlayerArea() {
  const { players, currentPlayer, phase, selectedAttackerIndex, selectedTargetPlayer, selectedTargetIndex, guessNumber, lastAttack, timeRemaining, config, selectAttacker } = useGame();
  const human      = players.human;
  const isMyTurn   = currentPlayer === 'human';
  const canSelect  = (phase === 'select_attacker' || phase === 'select_target') && isMyTurn && !human.isOut;

  const showTimer = timeRemaining !== null && isMyTurn && config.timeLimit > 0;
  const timerRatio = showTimer ? timeRemaining / config.timeLimit : 1;
  const timerColor = timerRatio > 0.5 ? 'bg-green-500' : timerRatio > 0.25 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div
      className={`
        bg-white rounded-2xl p-4 border-[3px] shadow-lg transition-all duration-300
        ${human.isOut ? 'opacity-50 border-gray-300' : ''}
        ${isMyTurn && !human.isOut ? 'border-orange-400' : ''}
        ${!isMyTurn && !human.isOut ? 'border-transparent' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{human.isOut ? '💀' : '😊'}</span>
        <span className="text-gray-800 font-bold">あなた</span>
        {isMyTurn && !human.isOut && (
          <span className="bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            ターン中
          </span>
        )}
        {human.isOut && (
          <span className="bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            脱落
          </span>
        )}
        {phase === 'select_attacker' && isMyTurn && !human.isOut && (
          <span className="ml-auto text-orange-500 text-xs font-bold animate-pulse">
            ← 攻撃カードを選んでください
          </span>
        )}
        {phase === 'select_target' && isMyTurn && !human.isOut && (
          <span className="ml-auto text-orange-400 text-xs">
            クリックで選びなおせます
          </span>
        )}
      </div>

      {/* タイマーバー */}
      {showTimer && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">残り時間</span>
            <span className={`font-black ${timerRatio <= 0.25 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
              {timeRemaining}秒
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-1000 ${timerColor}`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 1列スクロール */}
      <div className="flex gap-2 overflow-x-auto pb-6">
        {human.hand.map((card, i) => {
          let overlay: AttackOverlay | null = null;
          if (selectedTargetPlayer === 'human' && selectedTargetIndex === i && guessNumber !== null
              && phase === 'cpu_thinking') {
            overlay = { guess: guessNumber, result: 'pending' };
          } else if (lastAttack?.targetPlayerId === 'human' && lastAttack.targetIndex === i) {
            overlay = { guess: lastAttack.guessNumber, result: lastAttack.isHit ? 'hit' : 'miss' };
          }

          return (
            <div key={card.id} className="flex-shrink-0">
              <GameCard
                card={card}
                index={i}
                isOwner={true}
                isSelectable={canSelect && !card.isRevealed}
                isSelected={false}
                isAttackerSelected={selectedAttackerIndex === i}
                attackOverlay={overlay}
                onClick={() => selectAttacker(i)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
