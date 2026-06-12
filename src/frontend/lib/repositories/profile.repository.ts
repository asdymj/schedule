// profiles(#12 §3) 리포지토리 — F-001~F-005, GET/PATCH/DELETE /api/me
// 지금은 목업 구현이며, 함수 시그니처는 실습6에서 Supabase SDK 쿼리로 교체될 때 동일하게 유지됩니다.

export interface ProfileRow {
  id: string;
  nickname: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  plan: 'free' | 'pro' | 'family';
  created_at: string;
  deleted_at: string | null;
}

const mockProfiles: ProfileRow[] = [
  {
    id: 'u-001',
    nickname: '지우',
    email: 'asdymj@gmail.com',
    avatar_url: null,
    bio: null,
    plan: 'free',
    created_at: '2026-01-15T09:00:00+09:00',
    deleted_at: null,
  },
];

export async function getProfileById(userId: string): Promise<ProfileRow | null> {
  return mockProfiles.find((p) => p.id === userId && !p.deleted_at) ?? null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<ProfileRow, 'nickname' | 'avatar_url' | 'bio'>>,
): Promise<ProfileRow | null> {
  const profile = mockProfiles.find((p) => p.id === userId);
  if (!profile) return null;
  Object.assign(profile, patch);
  return profile;
}

// F-005 회원 탈퇴 — 데이터베이스설계서(#12) §6 fn_anonymize_user 트리거와 동일한 효과를 목업에서 시뮬레이션.
export async function anonymizeProfile(userId: string): Promise<void> {
  const profile = mockProfiles.find((p) => p.id === userId);
  if (!profile) return;
  profile.nickname = '(탈퇴한 사용자)';
  profile.avatar_url = null;
  profile.bio = null;
  profile.deleted_at = new Date().toISOString();
}
