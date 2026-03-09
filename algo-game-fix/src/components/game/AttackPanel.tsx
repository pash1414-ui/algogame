'use client';

import { useGame } from '@/hooks/useGame';
import { getCardNumbers } from '@/lib/constants';

export default function AttackPanel() {
  const {
    phase,
    currentPlayer,
    guessNumber,
    config,
    setGuessNumber,
    confirmAttack,
    cancelAttack,
  } = useGame();

  const isHumanDeclare = phase === 'declare' && currentPlayer === 'human';
  if (!isHumanDeclare) return null;

  const numbers = getCardNumbers(config.handSize);

  return (
    <div className="bg-white rounded-2xl px-3 py-2 shadow-lg border border-gray-100">
      <div className="flex items-center gap-2">
        {/* 左：数字ボタン */}
        <div className="flex flex-wrap gap-1.5 flex-1">
          {numbers.map((n) => (
            <button
              key={n}
              onClick={() => setGuessNumber(n)}
              className={`
                w-8 h-8 rounded-full border-2 font-bold text-sm transition-all
                ${guessNumber === n
                  ? 'bg-purple-700 text-white border-purple-700 scale-110'
                  : 'bg-white text-purple-700 border-purple-400 hover:bg-purple-100'}
              `}
            >
              {n}
            </button>
          ))}
        </div>

        {/* 右：ボタン縦並び */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={confirmAttack}
            disabled={guessNumber === null}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black rounded-xl transition-colors text-base"
          >
            あてる！
          </button>
          <button
            onClick={cancelAttack}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"
          >
            ← もどる
          </button>
        </div>
      </div>
    </div>
  );
}
