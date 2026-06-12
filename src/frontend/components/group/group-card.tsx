import Link from 'next/link';
import type { Group } from '@/types';
import { Card } from '@/components/ui';

// 화면설계서 §3.3 S-COMMON-HOME 그룹 카드 — 좌측 색상 링 + 그룹명 + 멤버수 + 최근 활동
export function GroupCard({ group }: { group: Group }) {
  return (
    <Link href={`/g/${group.id}/cal/month`}>
      <Card className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-h3"
          style={{ backgroundColor: `var(--color-group-${group.colorIndex})` }}
          aria-hidden
        >
          {group.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-h3 text-text-primary">{group.name}</p>
          <p className="truncate text-body-sm text-text-secondary">
            {group.memberCount}명 · {group.recentActivityAt}
          </p>
          {group.recentActivity && (
            <p className="truncate text-caption text-text-tertiary">{group.recentActivity}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
