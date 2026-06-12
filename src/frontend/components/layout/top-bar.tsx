import Link from 'next/link';
import { Bell, ChevronDown, Search } from 'lucide-react';
import { CountBadge } from '@/components/ui';

// 화면설계서 §3.3 Top Bar — 그룹 스위처/검색/알림. 정적 표시이므로 서버 컴포넌트로 유지.
export function TopBar({
  title,
  groupSwitcher = false,
  unreadCount = 0,
  backHref,
  actions,
}: {
  title: string;
  groupSwitcher?: boolean;
  unreadCount?: number;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-1">
        {backHref && (
          <Link href={backHref} className="-ml-2 flex h-9 w-9 items-center justify-center text-text-secondary" aria-label="뒤로 가기">
            <ChevronDown className="rotate-90" size={24} />
          </Link>
        )}
        <span className="text-h2 text-text-primary">{title}</span>
        {groupSwitcher && <ChevronDown size={20} className="text-text-secondary" aria-hidden />}
      </div>
      <div className="flex items-center gap-3 text-text-secondary">
        {actions}
        {!actions && (
          <>
            <Link href="/archive/search" aria-label="검색">
              <Search size={20} strokeWidth={1.75} />
            </Link>
            <Link href="/notifications" aria-label="알림" className="relative">
              <Bell size={20} strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5">
                  <CountBadge count={unreadCount} />
                </span>
              )}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
