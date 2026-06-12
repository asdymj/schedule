import { notFound } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { MemoryMap } from '@/components/archive/memory-map';
import { EmptyState } from '@/components/ui';
import { getGroup, getMapPins } from '@/lib/data';

// SCR-ID: S-ARCHIVE-MAP — 화면설계서 §7.2 (/g/:gid/map), GET /api/groups/{gid}/map-pins
// 서버 컴포넌트가 핀 목록을 가져오고, 핀 선택·지도 표시는 클라이언트 leaf(MemoryMap)에 위임.
export default async function ArchiveMapPage({ params }: { params: { gid: string } }) {
  const [group, pins] = await Promise.all([getGroup(params.gid), getMapPins(params.gid)]);
  if (!group) notFound();

  return (
    <main className="flex h-screen flex-col bg-background">
      <TopBar title="우리가 다녀온 곳" backHref={`/g/${group.id}/cal/month`} />
      {pins.length > 0 ? (
        <MemoryMap groupId={group.id} pins={pins} />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState icon="🗺️" title="아직 기록된 장소가 없어요" description="일정에 위치를 추가하면 지도에 모여요" />
        </div>
      )}
    </main>
  );
}
