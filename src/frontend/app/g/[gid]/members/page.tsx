import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { MemberList } from '@/components/group/member-list';
import { getGroup, getCurrentUser } from '@/lib/data';

// SCR-ID: S-GROUP-MEMBERS — 화면설계서 §4.2 (/g/:gid/members)
// 서버 컴포넌트: 멤버 목록 데이터를 가져와 렌더링하고, 메뉴 토글 인터랙션만 클라이언트 leaf에 위임.
export default async function GroupMembersPage({ params }: { params: { gid: string } }) {
  const [group, me] = await Promise.all([getGroup(params.gid), getCurrentUser()]);
  if (!group) notFound();

  return (
    <main className="min-h-screen bg-background">
      <TopBar title={`멤버 (${group.memberCount}/5)`} backHref={`/g/${group.id}/cal/month`} />
      <div className="border-b border-border px-4 py-3">
        <Link
          href={`/g/${group.id}/invite`}
          className="flex items-center justify-between rounded-button bg-primary-light px-4 py-2.5 text-body-strong text-primary-dark"
        >
          <span>+ 멤버 초대하기</span>
          <span>📋 코드</span>
        </Link>
      </div>
      <MemberList members={group.members} myId={me.id} />
      <p className="px-4 py-3 text-caption text-text-secondary">
        ⓘ Free 플랜은 5인까지 · <span className="text-primary">Pro로 무제한 가입 →</span>
      </p>
    </main>
  );
}
