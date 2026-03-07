'use client';

import { useGame } from '@/hooks/useGame';
import { HAND_SIZE_OPTIONS, getMaxNumber, DIFFICULTY_LABELS, TIME_LIMIT_OPTIONS } from '@/lib/constants';
import type { Difficulty } from '@/lib/types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function GameSettings() {
  const { config, setHandSize, setDifficulty, setTimeLimit } = useGame();
  const maxN  = getMaxNumber(config.handSize);
  const total = config.handSize * 4;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
      <h2 className="text-base font-black text-gray-800">⚙️ ゲーム設定</h2>

      {/* 枚数 */}
      <div>
        <p className="text-sm font-bold text-gray-700 mb-2">1人あたりの持ち枚数</p>
        <div className="flex gap-2 flex-wrap">
          {HAND_SIZE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setHandSize(n)}
              className={`
                flex-1 min-w-[60px] py-2.5 rounded-xl font-bold text-sm transition-all border-2
                ${config.handSize === n
                  ? 'bg-indigo-600 text-white border-indigo-600 scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}
              `}
            >
              {n}枚
            </button>
          ))}
        </div>
      </div>

      {/* 難易度 */}
      <div>
        <p className="text-sm font-bold text-gray-700 mb-2">相手の強さ（難易度）</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => {
            const info = DIFFICULTY_LABELS[d];
            return (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`
                  flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-2 flex flex-col items-center gap-0.5
                  ${config.difficulty === d
                    ? 'bg-indigo-600 text-white border-indigo-600 scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}
                `}
              >
                <span>{info.emoji}</span>
                <span>{info.label}</span>
                <span className={`text-[10px] font-normal ${config.difficulty === d ? 'text-indigo-100' : 'text-gray-400'}`}>
                  {info.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 制限時間 */}
      <div>
        <p className="text-sm font-bold text-gray-700 mb-2">⏱️ 攻撃の制限時間</p>
        <div className="flex gap-2 flex-wrap">
          {TIME_LIMIT_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTimeLimit(t)}
              className={`
                flex-1 min-w-[50px] py-2.5 rounded-xl font-bold text-sm transition-all border-2
                ${config.timeLimit === t
                  ? 'bg-orange-500 text-white border-orange-500 scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}
              `}
            >
              {t === 0 ? 'なし' : `${t}秒`}
            </button>
          ))}
        </div>
      </div>

      {/* 設定の説明 */}
      <div className="bg-indigo-50 rounded-xl p-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">使う数字</span>
          <span className="font-bold text-indigo-700">1 〜 {maxN}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">合計カード枚数</span>
          <span className="font-bold text-indigo-700">{total}枚（4人 × {config.handSize}枚）</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">プレイヤー</span>
          <span className="font-bold text-indigo-700">あなた + CPU × 3</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">制限時間</span>
          <span className="font-bold text-indigo-700">{config.timeLimit === 0 ? '制限なし' : `${config.timeLimit}秒`}</span>
        </div>
      </div>

      {config.handSize === 4 && (
        <p className="text-xs text-gray-400 text-center">← オリジナルのアルゴと同じ枚数設定です</p>
      )}
    </div>
  );
}
