import { createClient } from '@supabase/supabase-js';

// 브라우저(클라이언트 컴포넌트)에서 사용하는 Supabase 클라이언트.
// publishable(anon) 키만 사용 — service_role 키는 절대 여기에 두지 않습니다 (.AP-key.md §6 주의사항).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseBrowser = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
