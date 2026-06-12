import { TopBar } from '@/components/layout/top-bar';
import { SearchView } from '@/components/archive/search-view';
import { getAllEvents } from '@/lib/data';

// SCR-ID: S-ARCHIVE-SEARCH — 화면설계서 §7.5 (/archive/search), GET /api/groups/{gid}/search
// 서버 컴포넌트가 일정 목록을 가져오고, 검색어 입력/필터링/하이라이팅은
// 클라이언트 leaf(SearchView)에 위임.
export default async function ArchiveSearchPage() {
  const events = await getAllEvents();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <TopBar title="검색" backHref="/home" />
      <SearchView events={events} />
    </main>
  );
}
