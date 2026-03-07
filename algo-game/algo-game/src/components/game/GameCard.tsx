'use client';

import { motion } from 'framer-motion';
import type { Card } from '@/lib/types';

export interface AttackOverlay {
  guess: number;
  result: 'pending' | 'hit' | 'miss';
}

interface GameCardProps {
  card: Card;
  index: number;
  isOwner: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isAttackerSelected?: boolean;
  attackOverlay?: AttackOverlay | null;
  onClick?: () => void;
}

export default function GameCard({
  card,
  index,
  isOwner,
  isSelectable,
  isSelected,
  isAttackerSelected = false,
  attackOverlay = null,
  onClick,
}: GameCardProps) {
  const isVisible = isOwner || card.isRevealed;
  const isBlack   = card.color === 'black';

  // ヒット: 薄い半透明緑（元のカード色が透けて見える）
  // ミス: カードの色に合わせた背景（黒なら暗い、白なら明るい）
  const overlayBg =
    attackOverlay?.result === 'hit'
      ? 'bg-green-400/50'
      : attackOverlay?.result === 'miss'
      ? isBlack ? 'bg-gray-950/88' : 'bg-white/90'
      : attackOverlay?.result === 'pending'
      ? 'bg-amber-400/80 animate-pulse'
      : '';

  const borderClass = isAttackerSelected
    ? 'border-orange-400 shadow-[0_0_0_4px_rgba(251,146,60,0.7)]'
    : attackOverlay?.result === 'hit'
    ? 'border-green-400 shadow-[0_0_16px_rgba(74,222,128,0.7)]'
    : attackOverlay?.result === 'miss'
    ? 'border-red-400 shadow-[0_0_16px_rgba(248,113,113,0.7)]'
    : isSelected
    ? 'border-yellow-300 shadow-[0_0_0_4px_rgba(253,224,71,0.7)]'
    : '';

  const baseClass = `
    relative w-14 h-20 rounded-xl flex flex-col items-center justify-center
    font-bold border-2 select-none transition-all duration-150
    ${borderClass}
  `;

  // 表向きカードの色
  const colorClass = isBlack
    ? 'bg-gray-900 text-white border-gray-600'
    : 'bg-white text-gray-900 border-gray-300 shadow-sm';

  // 裏向きカードの色（相手から見た見た目）
  const hiddenColorClass = isBlack
    ? 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-400 border-gray-900 cursor-pointer'
    : 'bg-gradient-to-br from-slate-200 to-gray-100 text-gray-500 border-gray-400 cursor-pointer';

  // 自分の（まだ裏の）カード — 数字は見えるが相手には非公開
  const ownHiddenColorClass = isBlack
    ? 'bg-gray-900 text-white border-gray-600'
    : 'bg-white text-gray-900 border-gray-300 shadow-sm';

  if (isVisible) {
    // 自分の裏カード（数字は自分だけ見える）
    const isOwnHidden = isOwner && !card.isRevealed;
    const appliedColor = isOwnHidden ? ownHiddenColorClass : colorClass;

    return (
      <motion.div
        layout
        initial={{ scale: 0.6, opacity: 0, y: -30 }}
        animate={{
          scale: 1,
          opacity: card.isRevealed && isOwner ? 0.45 : 1,
          y: 0,
        }}
        whileHover={isSelectable && isOwnHidden ? { scale: 1.08, boxShadow: '0 6px 18px rgba(0,0,0,0.5)' } : {}}
        onClick={isSelectable && isOwnHidden ? onClick : undefined}
        className={`
          ${baseClass} ${appliedColor}
          ${isOwner && card.isRevealed ? 'grayscale-[40%]' : ''}
          ${isSelectable && isOwnHidden ? 'cursor-pointer' : ''}
        `}
      >
        <span className="text-2xl">{card.number}</span>
        {isOwner && card.isRevealed && (
          <span className="absolute bottom-1 text-[8px] font-bold text-gray-500 bg-white/80 px-1 rounded">
            めくれた
          </span>
        )}
        {isAttackerSelected && (
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-500 bg-white px-1 rounded border border-orange-400 whitespace-nowrap">
            攻撃カード
          </span>
        )}
        {attackOverlay && (
          <div className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-0.5 ${overlayBg}`}>
            {attackOverlay.result === 'hit' ? null : (
              <>
                <span className={`font-black text-2xl leading-none ${isBlack ? 'text-white' : 'text-gray-900'}`}>
                  {attackOverlay.guess}
                </span>
                {attackOverlay.result === 'miss' && (
                  <span className="text-red-500 text-xl font-black">✗</span>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // 相手の裏カード（数字は「?」）
  return (
    <motion.div
      layout
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isSelectable ? { scale: 1.08, boxShadow: '0 6px 18px rgba(0,0,0,0.5)' } : {}}
      onClick={isSelectable ? onClick : undefined}
      className={`
        ${baseClass} ${hiddenColorClass}
        ${!isSelectable ? 'cursor-default' : ''}
      `}
    >
      {attackOverlay && (
        <div className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-0.5 ${overlayBg}`}>
          <span className="text-white font-black text-2xl leading-none">{attackOverlay.guess}</span>
          {attackOverlay.result === 'hit'  && <span className="text-white text-base font-black">✓</span>}
          {attackOverlay.result === 'miss' && <span className="text-white text-base font-black">✗</span>}
        </div>
      )}
    </motion.div>
  );
}
