// sticker_packs(카탈로그, 정적 콘텐츠) + user_sticker_packs(#12) 리포지토리 — F-309 프리미엄 스티커 마켓
// (P-402 원본 'product' 리포지토리를 모먼토 도메인으로 매핑: product -> sticker pack)
// 지금은 목업 구현이며, 함수 시그니처는 실습6에서 Supabase SDK 쿼리로 교체될 때 동일하게 유지됩니다.

export interface StickerPackRow {
  id: string;
  name: string;
  category: 'emotion' | 'season' | 'character' | 'special';
  thumbnail_url: string;
  price: number; // KRW, 0 = 무료
  sticker_count: number;
}

export interface UserStickerPackRow {
  user_id: string;
  pack_id: string;
  acquired_at: string;
}

const mockStickerPackCatalog: StickerPackRow[] = [
  { id: 'pack-001', name: '기본 감정 팩', category: 'emotion', thumbnail_url: '/mock/sticker-emotion.svg', price: 0, sticker_count: 12 },
  { id: 'pack-002', name: '벚꽃 다이어리', category: 'season', thumbnail_url: '/mock/sticker-season.svg', price: 1500, sticker_count: 16 },
  { id: 'pack-003', name: '모먼토 프렌즈', category: 'character', thumbnail_url: '/mock/sticker-character.svg', price: 2500, sticker_count: 20 },
  { id: 'pack-004', name: '연말 한정 스페셜', category: 'special', thumbnail_url: '/mock/sticker-special.svg', price: 3000, sticker_count: 10 },
  { id: 'pack-005', name: '여름 휴가', category: 'season', thumbnail_url: '/mock/sticker-summer.svg', price: 1500, sticker_count: 14 },
];

const mockOwnership: UserStickerPackRow[] = [
  { user_id: 'u-001', pack_id: 'pack-001', acquired_at: '2026-01-15T09:00:00+09:00' },
  { user_id: 'u-001', pack_id: 'pack-002', acquired_at: '2026-04-02T10:00:00+09:00' },
];

export async function listStickerPacks(): Promise<StickerPackRow[]> {
  return mockStickerPackCatalog;
}

export async function getStickerPackById(packId: string): Promise<StickerPackRow | null> {
  return mockStickerPackCatalog.find((p) => p.id === packId) ?? null;
}

export async function listOwnedPackIds(userId: string): Promise<string[]> {
  return mockOwnership.filter((o) => o.user_id === userId).map((o) => o.pack_id);
}

// POST /api/market/packs/{pack_id}/purchase 등에서 결제 확인 후 호출 (멱등 — 이미 보유 시 기존 행 반환)
export async function grantStickerPack(userId: string, packId: string): Promise<UserStickerPackRow> {
  const existing = mockOwnership.find((o) => o.user_id === userId && o.pack_id === packId);
  if (existing) return existing;

  const row: UserStickerPackRow = { user_id: userId, pack_id: packId, acquired_at: new Date().toISOString() };
  mockOwnership.push(row);
  return row;
}
