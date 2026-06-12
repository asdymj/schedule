'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { CalendarEvent } from '@/types';
import { Card, EmptyState } from '@/components/ui';
import { cn, formatEventTime } from '@/lib/utils';

// 화면설계서 §7.5 S-ARCHIVE-SEARCH — 상단 search bar, 입력 300ms 디바운스 후 결과를
// 일정 카드 리스트로 표시하며 키워드를 <mark>로 하이라이팅한다.
// 현재는 GET /api/groups/{gid}/search 연동 전 단계이므로, 전체 일정(mock)을 클라이언트에서
// 필터링한다 (추후 API 연동 시 동일 UI를 유지하며 fetch로 교체).
export function SearchView({ events }: { events: CalendarEvent[] }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = debouncedQuery
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          (e.memo ?? '').toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : [];

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3">
        <label className="flex h-11 items-center gap-2 rounded-pill border border-border bg-surface-sunken px-4 text-body-sm text-text-primary">
          <Search size={18} className="text-text-tertiary" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="일정 제목, 메모, 장소로 검색"
            aria-label="일정 검색"
            autoFocus
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </label>
      </div>

      {!debouncedQuery && (
        <EmptyState icon="🔍" title="검색어를 입력해보세요" description="일정 제목이나 메모 내용으로 찾을 수 있어요" />
      )}

      {debouncedQuery && results.length === 0 && (
        <EmptyState icon="🗒️" title="검색 결과가 없어요" description={`'${debouncedQuery}'에 대한 일정을 찾지 못했어요`} />
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-2 px-4 pb-4">
          {results.map((event) => (
            <li key={event.id}>
              <Link href={`/g/${event.groupId}/e/${event.id}`}>
                <Card className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--color-group-${event.colorIndex})` }}
                      aria-hidden
                    />
                    <p className="truncate text-h3 text-text-primary">{highlight(event.title, debouncedQuery)}</p>
                  </div>
                  <p className="text-body-sm text-text-secondary">
                    {formatEventTime(event.startAt, event.endAt, event.isAllDay)} · {event.authorNickname}
                  </p>
                  {event.memo && (
                    <p className="truncate text-body-sm text-text-tertiary">{highlight(event.memo, debouncedQuery)}</p>
                  )}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 검색어와 일치하는 부분을 <mark>로 감싸 하이라이팅한다.
function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className={cn('rounded-sm bg-primary/20 text-text-primary')}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
