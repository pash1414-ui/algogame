'use client';

import { useGame } from '@/hooks/useGame';
import CpuArea from './CpuArea';
import PlayerArea from './PlayerArea';

import AttackPanel from './AttackPanel';
import GameOverModal from './GameOverModal';
import GameLog from './GameLog';
import GameSettings from './GameSettings';

const TABS = [
  { id: 'game' as const, label: '🎮 対戦' },
  { id: 'rules' as const, label: '📖 ルール' },
  { id: 'log' as const, label: '📋 ログ' },
];

export default function GameBoard() {
  const { phase, startMatch, activeTab, setActiveTab, config } = useGame();
  const maxN = config.handSize * 2;

  return (
    <div className="flex flex-col gap-3">
      {/* タブ */}
      <div className="flex gap-1 bg-white/10 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 rounded-lg text-sm font-bold transition-all
              ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white/70 hover:text-white'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 対戦タブ ─── */}
      {activeTab === 'game' && (
        <div className="flex flex-col gap-3">

          {/* スタート前 */}
          {phase === 'idle' && (
            <div className="flex flex-col gap-4">
              <GameSettings />
              <button
                onClick={startMatch}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl text-xl transition-colors shadow-lg"
              >
                🎮 マッチスタート！
              </button>
            </div>
          )}

          {/* ゲーム中 */}
          {phase !== 'idle' && (
            <>
              {/* 4段レイアウト（CPU3体 + プレイヤー） */}
              <p className="text-center text-white/40 text-[10px] tracking-widest">
              </p>

              <div
                className="rounded-2xl p-3 flex flex-col gap-2"
                style={{
                  background:
                    'radial-gradient(ellipse at center, #2e7d32 0%, #1b5e20 70%, #145214 100%)',
                  border: '6px solid #5d4037',
                  outline: '2px solid #8d6e63',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
                }}
              >
                <CpuArea playerId="cpu1" />
                <CpuArea playerId="cpu2" />
                <CpuArea playerId="cpu3" />
              </div>

              <AttackPanel />
              <PlayerArea />

              {phase === 'game_over' && (
                <button
                  onClick={startMatch}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors"
                >
                  もう一度！
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── ルールタブ ─── */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl p-5 text-sm text-gray-700 space-y-4 overflow-y-auto max-h-[70vh]">
          <h2 className="text-lg font-black text-gray-900">アルゴ ルール説明</h2>
          <RuleSection title="🃏 カードについて">
            <p>黒カード（1〜{maxN}）と白カード（1〜{maxN}）の合計 {maxN * 2} 枚を使います。</p>
            <p>同じ数字の場合は、黒が白より前（左）に並べます。</p>
          </RuleSection>
          <RuleSection title="🎮 ゲームの準備">
            <p>カードをシャッフルして4人に {config.handSize} 枚ずつ配ります（合計 {config.handSize * 4} 枚）。</p>
            <p>カードは自分だけ見て、数字の昇順に並べます。</p>
          </RuleSection>
          <RuleSection title="🔄 ターンの流れ">
            <ol className="list-decimal list-inside space-y-1">
              <li>自分のふせカードを1枚選びます（これが「攻撃カード」になります）</li>
              <li>相手の同じ色のふせカードを1枚狙います</li>
              <li>「あてる！」を押すと、攻撃カードの数字で宣言します</li>
              <li>正解なら相手のカードが表向きに。そのまま続けてアタックします！</li>
              <li>はずれなら、選んだ自分の攻撃カードが表向きになります（ペナルティ）</li>
            </ol>
          </RuleSection>
          <RuleSection title="💀 脱落">
            <p>自分のカードがすべて表向きになると脱落します。最後まで残った1人が勝ち！</p>
          </RuleSection>
          <RuleSection title="⚡ このゲームの特徴">
            <p>正解した後は自動的に続けてアタックします。どの自分のカードを使うか戦略が大切です！</p>
          </RuleSection>
        </div>
      )}

      {/* ─── ログタブ ─── */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-2xl p-4">
          <h2 className="text-sm font-bold text-gray-600 mb-3">📋 これまでの出来事</h2>
          <GameLog />
        </div>
      )}

      <GameOverModal />
    </div>
  );
}

function RuleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <div className="text-gray-600 space-y-1">{children}</div>
    </div>
  );
}
