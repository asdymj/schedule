-- ============================================================
-- 모먼토(Momento) Supabase 스키마 골격 — auth.users + public.profiles
-- 데이터베이스설계서(#12) §3, §7 발췌. 실습6에서 실제 Supabase 프로젝트에
-- 적용(supabase db push 또는 SQL Editor 실행)하여 사용합니다.
-- 현재 단계(M1~M4, 목업 리포지토리)에서는 적용 불필요.
-- ============================================================

-- 1) profiles — auth.users(Supabase Auth)와 1:1
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 20),
  avatar_url text,
  bio text check (char_length(bio) <= 100),
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'family')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- 2) auth.users 신규 가입 시 profiles 행 자동 생성
-- 닉네임은 OAuth 제공자(카카오/Google)의 raw_user_meta_data에서 채우고, 없으면 기본값 사용.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'nickname',
      new.raw_user_meta_data ->> 'full_name',
      '새 멤버'
    ),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
