import { createClient } from '@supabase/supabase-js';

// 서버(서버 컴포넌트 / Route Handlers)에서만 사용하는 Supabase 클라이언트.
// service_role 키는 RLS를 우회하므로 브라우저에 절대 노출하지 않습니다 — 이 파일은 'use client' 트리에서 import 금지.
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseServer = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;
