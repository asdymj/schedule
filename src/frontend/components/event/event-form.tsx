'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';

// SCR-ID: S-EVENT-NEW / S-EVENT-EDIT — 화면설계서 §6.1, §6.3
// 폼 입력·검증 상태(useState) + useSearchParams(쿼리 prefill) 사용 → 클라이언트 leaf, 부모는 <Suspense> 래핑.
export function EventForm({ groupId, prefillDate }: { groupId: string; prefillDate?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = prefillDate ?? searchParams.get('d') ?? new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('17:00');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');

  const titleValid = title.trim().length >= 1 && title.trim().length <= 50;
  const timeValid = allDay || start < end;
  const valid = titleValid && timeValid;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    // 목업 단계: POST /api/groups/{gid}/events 연동 지점. 생성 후 그룹 캘린더로 이동.
    router.push(`/g/${groupId}/cal/month`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 px-4 py-4 pb-24">
      <div>
        <label className="text-body-sm font-semibold text-text-secondary" htmlFor="event-title">제목</label>
        <input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 50))}
          placeholder="성수동 카페 투어"
          className="mt-1.5 h-11 w-full rounded-button border border-border bg-surface-sunken px-4 text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-body-sm font-semibold text-text-secondary">시작</label>
          <div className="mt-1.5 flex flex-col gap-1.5">
            <input value={date} readOnly className="h-11 rounded-button border border-border bg-surface-sunken px-3 text-body-sm text-text-secondary" />
            {!allDay && (
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-11 rounded-button border border-border bg-surface-sunken px-3 text-body-sm text-text-primary" />
            )}
          </div>
        </div>
        <div>
          <label className="text-body-sm font-semibold text-text-secondary">종료</label>
          <div className="mt-1.5 flex flex-col gap-1.5">
            <input value={date} readOnly className="h-11 rounded-button border border-border bg-surface-sunken px-3 text-body-sm text-text-secondary" />
            {!allDay && (
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="h-11 rounded-button border border-border bg-surface-sunken px-3 text-body-sm text-text-primary" />
            )}
          </div>
        </div>
      </div>
      {!timeValid && <p className="text-caption text-danger">⚠ 시작 시간이 종료 시간보다 빠라야 해요</p>}

      <label className="flex items-center gap-2 text-body-sm text-text-primary">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 accent-primary" />
        종일
      </label>
      <label className="flex items-center gap-2 text-body-sm text-text-primary">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="h-4 w-4 accent-primary" />
        비공개 (나만 보기)
      </label>

      <div>
        <label className="text-body-sm font-semibold text-text-secondary" htmlFor="event-location">위치 (선택)</label>
        <input
          id="event-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="🔍 카페 검색..."
          className="mt-1.5 h-11 w-full rounded-button border border-border bg-surface-sunken px-4 text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-body-sm font-semibold text-text-secondary" htmlFor="event-memo">메모 (선택)</label>
        <textarea
          id="event-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, 500))}
          rows={3}
          className="mt-1.5 w-full rounded-button border border-border bg-surface-sunken px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-right text-caption text-text-tertiary">{memo.length}/500</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface px-4 py-3">
        <Button type="submit" size="lg" disabled={!valid}>저장</Button>
      </div>
    </form>
  );
}
