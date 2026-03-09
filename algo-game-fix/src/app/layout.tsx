import type { Metadata } from 'next';
import './globals.css';
import AppBar from '@/components/layout/AppBar';
import Drawer from '@/components/layout/Drawer';
import MainWrapper from '@/components/layout/MainWrapper';

export const metadata: Metadata = {
  title: 'ALGO - カードゲーム',
  description: '論理的思考力を鍛えるカードゲーム「アルゴ」をブラウザで遊ぼう！',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <AppBar />
        <Drawer />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}
