'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { GroupColor, GroupType } from '@/types';

const TYPES: { value: GroupType; label: string }[] = [
  { value: 'friend', label: '친구' },
  { value: 'couple', label: '커플' },
  { value: 'family', label: '가족' },
  { value: 'club', label: '동호회' },
];
const ICONS = ['💖', '⭐', '🌸', '☕', '🏕️', '📚', '🎉', '🐾'];
const COLORS: GroupColor[] = [1, 2, 3, 4, 5, 6, 7, 8];

// SCR-ID: S-GROUP-NEW — 화면설계서 §4.1. 폼 입력·검증 상태가 필요한 leaf 클라이언트 컴포넌트.
export function GroupNewForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<GroupType>('friend');
  const [color, setColor] = useState<GroupColor>(1);
  const [icon, setIcon] = useState(ICONS[0]);

  const valid = name.trim().length >= 1 && name.trim().length <= 30;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    // 목업 단계: 실제 생성 대신 새 그룹 캘린더로 라우팅 (API스펙 #7 POST /api/groups 연동 지점)
    router.push('/g/g-001/cal/month');
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6 px-4 py-4">
      <div>
        <label className="text-body-sm font-semibold text-text-secondary" htmlFor="group-name">그룹 이름</label>
        <input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          placeholder="절친 4인방"
          className="mt-1.5 h-11 w-full rounded-button border border-border bg-surface-sunken px-4 text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-right text-caption text-text-tertiary">{name.length}/30</p>
      </div>

      <div>
        <p className="text-body-sm font-semibold text-text-secondary">그룹 유형</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                'rounded-pill border px-4 py-1.5 text-body-sm transition-colors duration-fast',
                type === t.value ? 'border-primary bg-primary-light text-primary-dark' : 'border-border text-text-secondary',
              )}
              aria-pressed={type === t.value}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-body-sm font-semibold text-text-secondary">색상</p>
        <div className="mt-2 flex gap-2">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              aria-label={`색상 ${c}`}
              aria-pressed={color === c}
              className={cn('h-6 w-6 rounded-pill transition-transform', color === c && 'scale-110 ring-2 ring-offset-2 ring-offset-surface ring-text-primary')}
              style={{ backgroundColor: `var(--color-group-${c})` }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-body-sm font-semibold text-text-secondary">아이콘</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button
              type="button"
              key={ic}
              onClick={() => setIcon(ic)}
              aria-pressed={icon === ic}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-card border text-h3',
                icon === ic ? 'border-primary bg-primary-light' : 'border-border bg-surface',
              )}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      <p className="text-caption text-text-tertiary">ⓘ 그룹 색상은 캘린더에 표시돼요</p>

      <Button type="submit" size="lg" disabled={!valid}>그룹 만들기</Button>
    </form>
  );
}
