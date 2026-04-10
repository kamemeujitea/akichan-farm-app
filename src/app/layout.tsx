import type { Metadata, Viewport } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';
import './globals.css';
import TabBar from '@/components/TabBar';

const zenMaru = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-zen-maru',
});

export const metadata: Metadata = {
  title: 'あきちゃんファーム',
  description: '長野県松本市内田の家庭菜園 栽培管理アプリ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'あきちゃんファーム',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6B8E23',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${zenMaru.variable} antialiased bg-cream text-soil min-h-screen`}>
        <div className="mx-auto max-w-md min-h-screen flex flex-col">
          <main className="flex-1 pb-24">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
