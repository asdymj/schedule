'use client';

import { useState } from 'react';
import type { Member } from '@/types';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

// 화면설계서 §5.1 멤버 필터 토글 — 클라이언트 상태(선택 토글) 필요, leaf 컴포넌트로 분리
export function MemberFilterBar({ members }: { members: Member[] }) {
  const [active, setActive] = useState<Set<string>>(new Set(members.map((m) => m.id)));

  function toggle(id: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2" role="group" aria-label="멤버 필터">
      {members.map((m) => {
        const isActive = active.has(m.id);
        return (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-pill border px-2.5 py-1 text-caption transition-colors duration-fast',
              isActive ? 'border-border-strong bg-surface text-text-primary' : 'border-border bg-surface-sunken text-text-tertiary',
            )}
            aria-pressed={isActive}
          >
            <Avatar nickname={m.nickname} colorIndex={m.colorIndex} size="xs" />
            {m.nickname}
          </button>
        );
      })}
    </div>
  );
}
