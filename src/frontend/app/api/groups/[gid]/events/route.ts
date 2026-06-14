import type { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getCurrentUser, getGroup } from '@/lib/data';
import { addEvent, emptyReactions } from '@/lib/mock/events';
import { supabaseServer } from '@/lib/supabase/server';
import type { CalendarEvent } from '@/types';

// API스펙(#7) POST /api/groups/{gid}/events — SCR-ID: S-EVENT-NEW (화면설계서 §6.1)
// Supabase events 테이블이 준비되면 그쪽에 먼저 적재하고, 테이블 미구축(M1)이거나
// 쿼리 실패 시 lib/mock/events의 인메모리 저장소에 반영해 캘린더에 즉시 표시되도록 한다.
export async function POST(req: NextRequest, { params }: { params: { gid: string } }) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 50) : '';
  const startAt = typeof body?.startAt === 'string' ? body.startAt : '';
  const endAt = typeof body?.endAt === 'string' ? body.endAt : startAt;
  if (!title || !startAt) {
    return apiError('VALIDATION_FAILED', '제목과 시작 일시는 필수입니다.');
  }

  const isAllDay = Boolean(body?.isAllDay);
  const isPrivate = Boolean(body?.isPrivate);
  const memo = typeof body?.memo === 'string' && body.memo.trim() ? body.memo.trim().slice(0, 500) : undefined;
  const locationName = typeof body?.location === 'string' && body.location.trim() ? body.location.trim() : undefined;

  const [group, user] = await Promise.all([getGroup(params.gid), getCurrentUser()]);
  if (!group) return apiError('RESOURCE_NOT_FOUND', '그룹을 찾을 수 없습니다.');

  const author = group.members.find((m) => m.id === user.id);
  const colorIndex = author?.colorIndex ?? 1;
  const location = locationName
    ? { id: `pin-${Date.now()}`, name: locationName, address: '', lat: 0, lng: 0, visitCount: 1, lastVisitedAt: startAt }
    : undefined;

  if (supabaseServer) {
    const { data, error } = await supabaseServer
      .from('events')
      .insert({
        group_id: group.id,
        author_id: user.id,
        title,
        start_at: startAt,
        end_at: endAt,
        is_all_day: isAllDay,
        is_private: isPrivate,
        memo,
        location: locationName ? { name: locationName } : null,
      })
      .select('id')
      .single();
    if (!error && data) return apiSuccess({ id: data.id }, 201);
  }

  const event: CalendarEvent = {
    id: `e-${Date.now().toString(36)}`,
    groupId: group.id,
    title,
    startAt,
    endAt,
    isAllDay,
    isPrivate,
    location,
    memo,
    authorId: user.id,
    authorNickname: user.nickname,
    colorIndex,
    reactions: emptyReactions(),
    comments: [],
    decorations: [],
    baseVersion: 1,
  };
  addEvent(event);
  return apiSuccess({ id: event.id }, 201);
}
