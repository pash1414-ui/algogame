'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGame';

const NAV_ITEMS = [
  { href: '/game', icon: '🎮', label: '対戦' },
  { href: '/rules', icon: '📖', label: 'ルール説明' },
  { href: '/strategy', icon: '🧠', label: '戦略ヒント' },
];

export default function Drawer() {
  const { isDrawerOpen, toggleDrawer } = useGame();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleDrawer}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* ドロワー */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-gray-900 z-50 flex flex-col pt-14 border-r border-white/10"
          >
            <div className="p-4">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3 px-3">メニュー</p>
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={toggleDrawer}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                          ${isActive
                            ? 'bg-white/15 text-white'
                            : 'text-white/60 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-auto p-4 border-t border-white/10">
              <p className="text-white/30 text-xs text-center">
                アルゴ © Gakken 2002<br />
                本実装はファンメイドです
              </p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
