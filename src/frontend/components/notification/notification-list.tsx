'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { NotificationItem } from '@/types';
import { Button, EmptyState, StatusDot } from '@/components/ui';
import { cn } from '@/lib/utils';

// 화면설계서 §8.1 — 카드 탭(읽음+딥링크)/모두 읽음/삭제는 Optimistic UI로 즉시 반영. leaf 클라이언트.
export function NotificationList({ initialItems }: { initialItems: NotificationItem[] }) {
  const [items, setItems] = useState(initialItems);

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }
  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }
  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState icon="🔔" title="아직 알림이 없어요" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-end px-4 py-2">
        <Button variant="ghost" size="sm" onClick={markAllRead}>모두 읽음</Button>
      </div>
      <ul className="flex flex-col">
        {items.map((n) => (
          <li key={n.id} className="flex items-stretch gap-2 border-b border-border px-4 py-3">
            <Link
              href={n.linkTo ?? '#'}
              onClick={() => markRead(n.id)}
              className={cn('flex flex-1 items-start gap-2', n.isRead && 'opacity-60')}
            >
              <span className="mt-1.5 w-3 shrink-0">{!n.isRead && <StatusDot tone="primary" />}</span>
              <span className="flex flex-col gap-0.5">
                <span className="text-body-strong text-text-primary">{n.title}</span>
                <span className="text-body-sm text-text-secondary">{n.body}</span>
                <span className="text-caption text-text-tertiary">{n.createdAt}</span>
              </span>
            </Link>
            <button
              onClick={() => dismiss(n.id)}
              aria-label="알림 삭제"
              className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-pill text-text-tertiary hover:bg-surface-sunken"
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
