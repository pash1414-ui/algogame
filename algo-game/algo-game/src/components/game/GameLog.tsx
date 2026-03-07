'use client';

import { useGame } from '@/hooks/useGame';

export default function GameLog() {
  const { log, players } = useGame();

  if (log.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-8">
        ゲームを始めるとログがここに表示されます
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-80 overflow-y-auto">
      {log.map((record) => {
        const attacker = players[record.attackerId]?.name ?? record.attackerId;
        const target = players[record.targetPlayerId]?.name ?? record.targetPlayerId;
        const colorLabel = record.guessColor === 'black' ? 'クロ' : 'シロ';
        return (
          <div
            key={record.id}
            className={`text-sm px-3 py-2 rounded-lg ${
              record.isHit ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {record.isHit ? '✅' : '❌'}{' '}
            <span className="font-bold">{attacker}</span> →{' '}
            {target} の {record.targetCardIndex + 1}番目「{colorLabel}の{record.guessNumber}」
            {record.isHit ? ' 正解！' : ' はずれ'}
          </div>
        );
      })}
    </div>
  );
}
