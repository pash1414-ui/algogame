'use client';

import { useGame } from '@/hooks/useGame';

export default function MessageBox() {
  const message = useGame((s) => s.message);
  return (
    <div className="bg-amber-50 border-l-4 border-orange-400 rounded-xl px-4 py-3 text-sm text-amber-900 min-h-[46px] shadow-sm">
      {message}
    </div>
  );
}
