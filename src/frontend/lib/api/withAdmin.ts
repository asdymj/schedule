import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSessionClient } from '@/lib/supabase/server-session';
import { apiError } from '@/lib/api/response';
import { withAuth } from '@/lib/api/withAuth';

export type GroupRole = 'owner' | 'admin' | 'member';

export type AdminHandler<C> = (
  req: NextRequest,
  ctx: C & { user: User; role: GroupRole },
) => Promise<Response>;

// 그룹 admin/owner 권한 검사 래퍼.
// 원본 P-402는 profiles.role(전역 관리자)을 가정하지만, 데이터베이스설계서(#12)에는 전역 role이
// 없고 그룹별 group_members.role(owner|admin|member)만 존재합니다. 따라서 withAdmin은 라우트
// params의 그룹 ID(gid) 기준으로 현재 사용자의 owner/admin 권한을 검사합니다.
// 예: POST /api/groups/{gid}/export (REQ-073, owner 전용)
export function withAdmin<C extends { params: { gid: string } }>(handler: AdminHandler<C>) {
  return withAuth<C>(async (req, ctx) => {
    const client = createSessionClient();
    if (!client) return apiError('SERVICE_UNAVAILABLE', 'Supabase 클라이언트를 초기화할 수 없습니다.');

    const groupId = ctx.params.gid;
    const { data, error } = await client
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', ctx.user.id)
      .maybeSingle();

    const role = data?.role as GroupRole | undefined;
    if (error || !role || !['owner', 'admin'].includes(role)) {
      return apiError('FORBIDDEN_ROLE', '관리자(owner/admin) 권한이 필요합니다.', { group_id: groupId });
    }

    return handler(req, { ...ctx, role });
  });
}
