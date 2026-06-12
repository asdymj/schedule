import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { EventForm } from '@/components/event/event-form';
import { getGroup } from '@/lib/data';

// SCR-ID: S-EVENT-NEW — 화면설계서 §6.1 (/g/:gid/e/new?d=YYYY-MM-DD), POST /api/groups/{gid}/events
// 서버 셸이 그룹 컨텍스트를 가져오고, useSearchParams를 쓰는 폼은 클라이언트 leaf로 분리해 <Suspense> 래핑.
export default async function EventNewPage({
  params,
  searchParams,
}: {
  params: { gid: string };
  searchParams: { d?: string };
}) {
  const group = await getGroup(params.gid);
  if (!group) notFound();

  return (
    <main className="min-h-screen bg-background">
      <TopBar title="일정 만들기" backHref={`/g/${group.id}/cal/month`} />
      <Suspense fallback={null}>
        <EventForm groupId={group.id} prefillDate={searchParams.d} />
      </Suspense>
    </main>
  );
}
