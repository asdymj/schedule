import Link from 'next/link';
import { TopBar } from '@/components/layout/top-bar';
import { PageShell } from '@/components/layout/page-shell';
import { GroupCard } from '@/components/group/group-card';
import { Button, DashedCard, EmptyState } from '@/components/ui';
import { getCurrentUser, getMyGroups, getUnreadNotificationCount } from '@/lib/data';

// SCR-ID: S-COMMON-HOME — 화면설계서 §3.3 (/home)
// 서버 컴포넌트: lib/data에서 직접 await로 목업(추후 Supabase) 데이터를 가져와 렌더링.
export default async function HomePage() {
  const [user, groups, unread] = await Promise.all([
    getCurrentUser(),
    getMyGroups(),
    getUnreadNotificationCount(),
  ]);

  return (
    <PageShell>
      <TopBar title={`안녕, ${user.nickname} 👋`} unreadCount={unread} />
      <section className="px-4 py-4">
        <h2 className="text-h2 text-text-primary">내 그룹 ({groups.length})</h2>
        {groups.length === 0 ? (
          <>
            <EmptyState icon="💌" title="첫 그룹을 만들어 우리만의 캘린더를 시작해보세요" />
            <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
              <Link href="/g/new">
                <Button size="lg">+ 새 그룹 만들기</Button>
              </Link>
              <Link href="/join">
                <Button variant="secondary" size="lg">🔗 초대 코드 입력하기</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
            <Link href="/g/new">
              <DashedCard className="h-[72px]">+ 새 그룹 만들기</DashedCard>
            </Link>
            <Link href="/join">
              <DashedCard className="h-[56px]">🔗 초대 코드 입력하기</DashedCard>
            </Link>
          </div>
        )}
      </section>
    </PageShell>
  );
}
