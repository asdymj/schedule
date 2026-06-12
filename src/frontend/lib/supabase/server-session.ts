import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// 세션(쿠키) 기반 서버 Supabase 클라이언트 — anon 키 + 로그인 사용자의 auth 쿠키를 사용해
// RLS가 적용된 채로 "현재 로그인 사용자" 컨텍스트의 데이터를 조회합니다 (시스템정의서 §6 보안 정책 정합).
// service_role을 쓰는 lib/supabase/server.ts(관리자 권한, 신뢰된 읽기 전용)와는 용도가 다릅니다.
//
// 서버 컴포넌트에서는 쿠키를 쓸 수 없으므로 set/remove는 no-op으로 둡니다 — 세션 갱신은
// app/auth/callback/route.ts(Route Handler)에서 처리합니다.
export function createSessionClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const cookieStore = cookies();
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // 서버 컴포넌트에서는 쿠키 쓰기 불가 — Route Handler/미들웨어에서 세션 갱신
      },
      remove() {
        // 위와 동일
      },
    },
  });
}

export async function getSessionUser() {
  const client = createSessionClient();
  if (!client) return null;
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}
