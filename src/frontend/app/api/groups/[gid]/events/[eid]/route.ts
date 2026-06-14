import type { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { updateEvent } from '@/lib/mock/events';
import { supabaseServer } from '@/lib/supabase/server';

// API스펙(#7) PATCH /api/groups/{gid}/events/{eid} — SCR-ID: S-EVENT-EDIT (화면설계서 §6.3)
export async function PATCH(req: NextRequest, { params }: { params: { gid: string; eid: string } }) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 50) : '';
  const startAt = typeof body?.startAt === 'string' ? body.startAt : '';
  if (!title || !startAt) {
    return apiError('VALIDATION_FAILED', '제목과 시작 일시는 필수입니다.');
  }

  const endAt = typeof body?.endAt === 'string' ? body.endAt : startAt;
  const isAllDay = Boolean(body?.isAllDay);
  const isPrivate = Boolean(body?.isPrivate);
  const memo = typeof body?.memo === 'string' && body.memo.trim() ? body.memo.trim().slice(0, 500) : undefined;
  const locationName = typeof body?.location === 'string' && body.location.trim() ? body.location.trim() : undefined;

  if (supabaseServer) {
    const { error } = await supabaseServer
      .from('events')
      .update({
        title,
        start_at: startAt,
        end_at: endAt,
        is_all_day: isAllDay,
        is_private: isPrivate,
        memo,
        location: locationName ? { name: locationName } : null,
      })
      .eq('id', params.eid)
      .eq('group_id', params.gid);
    if (!error) return apiSuccess({ id: params.eid });
  }

  const updated = updateEvent(params.eid, {
    title,
    startAt,
    endAt,
    isAllDay,
    isPrivate,
    memo,
    location: locationName
      ? { id: `pin-${Date.now()}`, name: locationName, address: '', lat: 0, lng: 0, visitCount: 1, lastVisitedAt: startAt }
      : undefined,
  });
  if (!updated) return apiError('RESOURCE_NOT_FOUND', '일정을 찾을 수 없습니다.');

  return apiSuccess({ id: params.eid });
}
