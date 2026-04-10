'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: '畑', icon: '🗺️' },
  { href: '/calendar', label: '予定', icon: '📅' },
  { href: '/progress', label: '進捗', icon: '📊' },
  { href: '/shift', label: 'シフト', icon: '👥' },
  { href: '/budget', label: '費用', icon: '💰' },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur border-t border-soil/10 safe-bottom z-50">
      <ul className="grid grid-cols-5 h-[60px]">
        {TABS.map((t) => {
          const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex flex-col items-center justify-center h-full min-h-[60px] px-1 transition-colors ${
                  active
                    ? 'text-leafDark font-bold bg-leaf/10 border-t-2 border-leafDark'
                    : 'text-soilLight'
                }`}
              >
                <span className="text-2xl leading-none mb-0.5">{t.icon}</span>
                <span className="text-xs">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
