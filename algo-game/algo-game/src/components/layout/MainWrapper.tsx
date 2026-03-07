'use client';

import { useGame } from '@/hooks/useGame';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const { phase } = useGame();
  const isPlaying = phase !== 'idle';

  return (
    <main
      className={`${isPlaying ? 'pt-0' : 'pt-14'} min-h-screen`}
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' }}
    >
      {children}
    </main>
  );
}
