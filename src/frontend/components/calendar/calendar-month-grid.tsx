'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';

// 화면설계서 §5.1 S-CAL-MONTH 월 뷰 그리드 — 날짜 선택 상태가 필요해 클라이언트 컴포넌트로 분리.
// 셸(Top Bar, 멤버 필터)은 서버 컴포넌트로 두고, 그리드만 leaf에서 'use client' 적용.
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function buildMonthMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function CalendarMonthGrid({
  groupId,
  year,
  month,
  events,
}: {
  groupId: string;
  year: number;
  month: number; // 0-based
  events: CalendarEvent[];
}) {
  const today = new Date();
  const [selected, setSelected] = useState<string | null>(null);
  const matrix = useMemo(() => buildMonthMatrix(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = e.startAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const selectedEvents = selected ? eventsByDate.get(selected) ?? [] : [];

  return (
    <div>
      <div className="grid grid-cols-7 px-2 pt-2 text-center text-caption text-text-tertiary">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={cn(i === 0 && 'text-danger', i === 6 && 'text-info')}>
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 px-2 pb-2">
        {matrix.flat().map((date, idx) => {
          if (!date) return <div key={idx} />;
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const dayEvents = eventsByDate.get(key) ?? [];
          const isToday = isSameDay(date, today);
          const isSelected = selected === key;

          return (
            <button
              key={idx}
              onClick={() => setSelected(isSelected ? null : key)}
              className="flex flex-col items-center gap-0.5 py-1.5"
              aria-pressed={isSelected}
              aria-label={`${date.getDate()}일${dayEvents.length ? `, 일정 ${dayEvents.length}건` : ''}`}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-pill text-body-sm font-semibold',
                  isToday && 'bg-primary text-text-on-primary',
                  !isToday && isSelected && 'border border-primary bg-primary-light text-primary-dark',
                  !isToday && !isSelected && 'text-text-primary',
                )}
              >
                {date.getDate()}
              </span>
              <span className="flex h-1.5 gap-0.5">
                {dayEvents.slice(0, 4).map((e) => (
                  <span
                    key={e.id}
                    className="block h-1.5 w-1.5 rounded-pill"
                    style={{ backgroundColor: `var(--color-group-${e.colorIndex})` }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-body-sm font-semibold text-text-secondary">
            {Number(selected.slice(5, 7))}월 {Number(selected.slice(8, 10))}일
          </p>
          {selectedEvents.length === 0 ? (
            <Link
              href={`/g/${groupId}/e/new?d=${selected}`}
              className="block rounded-card border border-dashed border-border-strong px-4 py-3 text-center text-body-sm text-text-tertiary"
            >
              + 이 날짜에 일정 추가
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/g/${groupId}/e/${e.id}`}
                  className="flex items-center gap-2 rounded-card border border-border bg-surface px-3 py-2"
                >
                  <span className="h-8 w-1 rounded-pill" style={{ backgroundColor: `var(--color-group-${e.colorIndex})` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-strong text-text-primary">{e.title}</p>
                    <p className="truncate text-caption text-text-secondary">
                      {e.location ? `📍 ${e.location.name}` : '장소 미정'} · ♥{e.reactions[0]?.count ?? 0} 💬{e.comments.length}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
