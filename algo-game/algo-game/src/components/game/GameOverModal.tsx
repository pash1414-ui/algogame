'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { ALL_PLAYER_IDS } from '@/lib/types';
import { TOTAL_ROUNDS, MATCH_START_ORDER } from '@/lib/constants';

const PLAYER_ICONS: Record<string, string> = {
  human: '😊',
  cpu1: '🐱',
  cpu2: '🐶',
  cpu3: '🦔',
};

export default function GameOverModal() {
  const { phase, winner, score, players, matchRound, startNextRound, startMatch } = useGame();
  const isOpen = phase === 'game_over' || phase === 'match_over';
  const isMatchOver = phase === 'match_over';

  // 通算スコアの最高得点者
  const maxScore = Math.max(...ALL_PLAYER_IDS.map((id) => score[id]));
  const matchWinners = ALL_PLAYER_IDS.filter((id) => score[id] === maxScore);
  const isHumanMatchWinner = matchWinners.includes('human');

  // 次のラウンドのスタートプレイヤー
  const nextStartPlayer = !isMatchOver ? MATCH_START_ORDER[matchRound % TOTAL_ROUNDS] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-7 text-center max-w-sm w-full mx-4 shadow-2xl"
          >
            {/* ラウンド表示 */}
            <div className="text-xs font-bold text-gray-400 mb-1 tracking-widest">
              {isMatchOver ? `全${TOTAL_ROUNDS}ラウンド終了` : `ラウンド ${matchRound} ／ ${TOTAL_ROUNDS} 終了`}
            </div>

            <div className="text-5xl mb-2">
              {isMatchOver
                ? (isHumanMatchWinner ? '🏆' : PLAYER_ICONS[matchWinners[0]] ?? '🤖')
                : (winner ? PLAYER_ICONS[winner] ?? '🤖' : '🤖')}
            </div>

            {isMatchOver ? (
              <>
                <h2 className="text-2xl font-black mb-1">
                  {matchWinners.length === 1
                    ? `${players[matchWinners[0]]?.name} の優勝！`
                    : '引き分け！'}
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  {isHumanMatchWinner ? 'すごい！全ラウンド制覇！' : 'またチャレンジしてね！'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-1">
                  {winner ? players[winner]?.name : '?'} の勝ち！
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  {winner === 'human' ? 'すごい！おめでとう！' : 'またチャレンジしてね！'}
                </p>
              </>
            )}

            {/* 今ゲームの結果 */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-sm">
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">このラウンドの結果</p>
              <div className="space-y-2">
                {ALL_PLAYER_IDS.map((id) => {
                  const player = players[id];
                  const hand = player.hand;
                  const hidden = hand.filter((c) => !c.isRevealed).length;
                  const revealed = hand.filter((c) => c.isRevealed).length;
                  const isRoundWinner = id === winner;
                  return (
                    <div key={id} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isRoundWinner ? 'bg-yellow-50 border border-yellow-300' : 'bg-white border border-gray-100'}`}>
                      <span className="text-xl">{isRoundWinner ? '👑' : player.isOut ? '💀' : (PLAYER_ICONS[id] ?? '🃏')}</span>
                      <span className={`font-bold flex-1 text-left text-sm ${isRoundWinner ? 'text-yellow-700' : player.isOut ? 'text-gray-400' : 'text-gray-700'}`}>
                        {player.name}
                      </span>
                      {player.isOut ? (
                        <span className="text-xs text-gray-400 font-bold">脱落</span>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">残り <span className="font-black text-indigo-600 text-base">{hidden}</span> 枚</span>
                          {revealed > 0 && <span className="text-gray-300">/ めくれ {revealed}枚</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 通算スコア */}
            <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-5 text-sm">
              <p className="text-xs font-bold text-indigo-400 mb-2">
                通算スコア（{matchRound}／{TOTAL_ROUNDS}ラウンド）
              </p>
              <div className="flex justify-around">
                {ALL_PLAYER_IDS.map((id) => {
                  const isTopScore = score[id] === maxScore && maxScore > 0;
                  return (
                    <div key={id} className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-gray-500">{players[id]?.name}</span>
                      <span className={`font-black text-lg ${isTopScore ? 'text-indigo-600' : 'text-gray-300'}`}>
                        {score[id]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isMatchOver ? (
              <button
                onClick={startMatch}
                className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl text-xl transition-colors"
              >
                🎮 新しいマッチを始める
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={startNextRound}
                  className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-xl transition-colors"
                >
                  ▶ ラウンド {matchRound + 1} へ
                  {nextStartPlayer && (
                    <span className="block text-xs font-normal opacity-80 mt-0.5">
                      {players[nextStartPlayer]?.name} がスタート
                    </span>
                  )}
                </button>
                <button
                  onClick={startMatch}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"
                >
                  最初からやり直す
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
