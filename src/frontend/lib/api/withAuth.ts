import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSessionClient } from '@/lib/supabase/server-session';
import { apiError } from '@/lib/api/response';

// Supabase Auth(@supabase/ssr 쿠키 세션) 기반 인증 래퍼.
// 자체 bcrypt/JWT(JWT_SECRET) 발급은 사용하지 않으며, supabase.auth.getUser()로 세션 사용자를
// 검증한 뒤 핸들러에 user를 주입합니다.

export type AuthedHandler<C> = (req: NextRequest, ctx: C & { user: User }) => Promise<Response>;

export function withAuth<C = Record<string, never>>(handler: AuthedHandler<C>) {
  return async (req: NextRequest, ctx: C): Promise<Response> => {
    const client = createSessionClient();
    if (!client) return apiError('SERVICE_UNAVAILABLE', 'Supabase 클라이언트를 초기화할 수 없습니다.');

    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return apiError('UNAUTHORIZED', '로그인이 필요합니다.');

    return handler(req, { ...ctx, user: data.user });
  };
}
