'use client';

import { useState } from 'react';
import type { Reaction } from '@/types';
import { cn, reactionEmoji } from '@/lib/utils';

// 화면설계서 §6.2 ReactionBar — 6종 이모지, Optimistic UI(클릭 즉시 반영). 상호작용 leaf → 'use client'
export function ReactionBar({ reactions }: { reactions: Reaction[] }) {
  const [state, setState] = useState(reactions);

  function toggle(type: Reaction['type']) {
    setState((prev) =>
      prev.map((r) =>
        r.type === type
          ? { ...r, reactedByMe: !r.reactedByMe, count: r.count + (r.reactedByMe ? -1 : 1) }
          : r,
      ),
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="이모지 리액션">
      {state.map((r) => (
        <button
          key={r.type}
          onClick={() => toggle(r.type)}
          className={cn(
            'flex items-center gap-1 rounded-pill border px-2.5 py-1 text-body-sm transition-transform duration-fast active:scale-95',
            r.reactedByMe ? 'border-primary bg-primary-light text-primary-dark' : 'border-border bg-surface text-text-secondary',
          )}
          aria-pressed={r.reactedByMe}
          aria-label={`${r.type} 리액션, ${r.count}개`}
        >
          <span aria-hidden>{reactionEmoji(r.type)}</span>
          {r.count > 0 && <span className="text-caption font-semibold">{r.count}</span>}
        </button>
      ))}
    </div>
  );
}
