import { notFound } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { InviteActions } from '@/components/group/invite-actions';
import { getGroup, getInviteCode } from '@/lib/data';

// SCR-ID: S-GROUP-INVITE — 화면설계서 §4.3 (/g/:gid/invite), POST /api/groups/{gid}/invites
export default async function GroupInvitePage({ params }: { params: { gid: string } }) {
  const [group, invite] = await Promise.all([getGroup(params.gid), getInviteCode(params.gid)]);
  if (!group) notFound();

  return (
    <main className="min-h-screen bg-background">
      <TopBar title="초대" backHref={`/g/${group.id}/members`} />
      <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
        <p className="text-h2 text-text-primary">💌 친구를 초대해보세요</p>
        <div className="my-3 w-full max-w-xs rounded-card border border-border bg-surface-sunken py-5">
          <p className="text-display tracking-[0.2em] text-text-primary">{invite.code}</p>
        </div>
        <p className="text-body-sm text-text-secondary">⏱️ 24시간 후 만료</p>
        <p className="text-caption text-text-tertiary">ⓘ 1번만 사용 가능</p>

        <div className="mt-6 w-full max-w-xs">
          <InviteActions code={invite.code} />
        </div>
      </div>
    </main>
  );
}
