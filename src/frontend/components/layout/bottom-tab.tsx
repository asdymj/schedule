'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Newspaper, Plus, Image as ImageIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// 화면설계서 §3.3 S-COMMON-HOME 등 — Bottom Tab + 중앙 FAB. 라우트 활성 표시는 클라이언트 훅(usePathname) 필요.
const TABS = [
  { href: '/home', label: '캘린더', icon: Calendar },
  { href: '/archive', label: '피드', icon: Newspaper },
  { href: '/g/g-001/e/new', label: '추가', icon: Plus, isFab: true },
  { href: '/gallery', label: '갤러리', icon: ImageIcon },
  { href: '/me', label: '마이', icon: User },
] as const;

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="주요 내비게이션"
    >
      {TABS.map(({ href, label, icon: Icon, isFab }) => {
        const active = pathname?.startsWith(href.split('?')[0].replace(/\/(new|g-001)$/, ''));
        if (isFab) {
          return (
            <Link
              key={href}
              href={href}
              aria-label="새 일정 추가"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-pill bg-primary text-text-on-primary shadow-modal transition-transform duration-fast active:scale-95"
            >
              <Icon size={28} strokeWidth={2} />
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-caption transition-colors duration-fast',
              active ? 'text-primary' : 'text-text-tertiary',
            )}
          >
            <Icon size={24} strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
