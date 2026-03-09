'use client';

import { useGame } from '@/hooks/useGame';

export default function AppBar() {
  const { phase } = useGame();
  const isPlaying = phase !== 'idle';

  if (isPlaying) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-indigo-900 border-b border-indigo-700 h-14 flex items-center px-4 gap-3">
      <h1 className="text-white font-black text-xl tracking-widest">ALGO</h1>
      <span className="text-white/30 text-xs hidden sm:inline">カードゲーム</span>
    </header>
  );
}
