import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { TopBar } from '@/components/layout/top-bar';
import { PageShell } from '@/components/layout/page-shell';
import { MemberFilterBar } from '@/components/group/member-filter-bar';
import { CalendarMonthGrid } from '@/components/calendar/calendar-month-grid';
import { EmptyState } from '@/components/ui';
import { getGroup, getGroupEvents, getUnreadNotificationCount } from '@/lib/data';

// SCR-ID: S-CAL-MONTH (기본 랜딩) / S-CAL-WEEK / S-CAL-DAY / S-CAL-LIST — 화면설계서 §5
// (/g/:gid/cal/:view?d=YYYY-MM&filter=...), GET /api/groups/{gid}/events
// 동적 라우트([gid], [view]). 서버 컴포넌트에서 데이터 fetch 후, 셀 선택 등 인터랙션은
// CalendarMonthGrid(leaf, 'use client')에 위임. week/day/list는 P1 — 월 뷰로 폴백 안내.
export default async function CalendarViewPage({
  params,
}: {
  params: { gid: string; view: string };
}) {
  const [group, events, unread] = await Promise.all([
    getGroup(params.gid),
    getGroupEvents(params.gid),
    getUnreadNotificationCount(),
  ]);
  if (!group) notFound();

  const now = new Date();
  const isMonth = params.view === 'month';

  return (
    <PageShell>
      <TopBar title={`${group.icon} ${group.name}`} groupSwitcher unreadCount={unread} />
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-h2 text-text-primary">
          {now.getFullYear()}년 {now.getMonth() + 1}월
        </p>
        <Link
          href={`/g/${group.id}/e/new`}
          className="flex h-9 items-center gap-1 rounded-pill bg-primary px-3 text-body-sm font-semibold text-text-on-primary"
        >
          <Plus size={16} /> 일정
        </Link>
      </div>
      <MemberFilterBar members={group.members} />

      {isMonth ? (
        <CalendarMonthGrid groupId={group.id} year={now.getFullYear()} month={now.getMonth()} events={events} />
      ) : (
        <EmptyState
          icon="🗓️"
          title={`${params.view} 뷰는 준비 중이에요`}
          description="현재는 월 뷰에서 모든 일정을 확인할 수 있어요"
          actionLabel="월 뷰로 보기"
        />
      )}

      {events.length === 0 && (
        <EmptyState icon="📝" title="첫 일정을 만들어보세요" actionLabel="일정 추가하기" />
      )}
    </PageShell>
  );
}
