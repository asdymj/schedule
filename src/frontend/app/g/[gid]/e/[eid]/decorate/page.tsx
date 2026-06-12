import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CanvasEditor } from '@/components/event/canvas-editor';
import { getEvent, getGroup } from '@/lib/data';

// SCR-ID: S-EVENT-EDITOR — 화면설계서 §6.4 (/g/:gid/e/:eid/decorate)
// 풀스크린 캔버스 에디터 — 전체가 드래그/도구 인터랙션이므로 클라이언트 leaf(CanvasEditor)에 위임,
// 서버 셸은 데이터 fetch + notFound 가드만 담당하고 <Suspense>로 감쌉니다.
export default async function EventDecoratePage({
  params,
}: {
  params: { gid: string; eid: string };
}) {
  const [group, event] = await Promise.all([getGroup(params.gid), getEvent(params.eid)]);
  if (!group || !event || event.groupId !== group.id) notFound();

  return (
    <Suspense fallback={null}>
      <CanvasEditor
        groupId={group.id}
        eventId={event.id}
        eventTitle={event.title}
        initialNodes={event.decorations}
      />
    </Suspense>
  );
}
