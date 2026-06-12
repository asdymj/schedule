import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Lock } from 'lucide-react';
import { TopBar } from '@/components/layout/top-bar';
import { Avatar, Badge } from '@/components/ui';
import { ReactionBar } from '@/components/event/reaction-bar';
import { CommentList } from '@/components/event/comment-list';
import { getEvent, getGroup } from '@/lib/data';
import { formatEventTime } from '@/lib/utils';

// SCR-ID: S-EVENT-DETAIL — 화면설계서 §6.2 (/g/:gid/e/:eid), GET /api/events/{eid}
// 서버 컴포넌트가 일정 상세를 렌더링하고, 리액션·댓글 인터랙션만 클라이언트 leaf에 위임(Optimistic UI).
export default async function EventDetailPage({
  params,
}: {
  params: { gid: string; eid: string };
}) {
  const [group, event] = await Promise.all([getGroup(params.gid), getEvent(params.eid)]);
  if (!group || !event || event.groupId !== group.id) notFound();

  const author = group.members.find((m) => m.id === event.authorId);

  return (
    <main className="min-h-screen bg-background pb-10">
      <TopBar
        title="일정 상세"
        backHref={`/g/${group.id}/cal/month`}
        actions={
          <Link
            href={`/g/${group.id}/e/${event.id}/decorate`}
            className="rounded-pill bg-primary-light px-3 py-1.5 text-body-sm font-semibold text-primary-dark"
          >
            🎨 꾸미기
          </Link>
        }
      />

      {event.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.thumbnailUrl} alt="" className="aspect-[4/3] w-full object-cover" />
      )}

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-h1 text-text-primary">{event.title}</h1>
              {event.isPrivate && <Lock size={16} className="text-text-tertiary" aria-label="비공개 일정" />}
            </div>
            <p className="mt-1 text-body-sm text-text-secondary">
              {formatEventTime(event.startAt, event.endAt, event.isAllDay)}
            </p>
          </div>
          <Badge style={{ backgroundColor: `var(--color-group-${event.colorIndex})` }} className="text-white">
            {group.icon} {group.name}
          </Badge>
        </div>

        {author && (
          <div className="flex items-center gap-2">
            <Avatar nickname={author.nickname} colorIndex={author.colorIndex} size="sm" />
            <span className="text-body-sm text-text-secondary">{event.authorNickname}님이 작성</span>
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-2 rounded-card border border-border bg-surface-sunken px-3 py-2.5 text-body-sm text-text-primary">
            <MapPin size={16} className="text-primary" />
            <span>{event.location.name}</span>
            <span className="text-text-tertiary">· {event.location.address}</span>
          </div>
        )}

        {event.memo && <p className="whitespace-pre-wrap text-body text-text-primary">{event.memo}</p>}

        {event.decorations.length > 0 && (
          <p className="text-caption text-text-tertiary">🖼️ 꾸민 요소 {event.decorations.length}개 — '꾸미기'에서 확인하세요</p>
        )}

        <ReactionBar reactions={event.reactions} />
        <hr className="border-border" />
        <CommentList initialComments={event.comments} />
      </div>
    </main>
  );
}
