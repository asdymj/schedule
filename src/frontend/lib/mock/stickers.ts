import type { StickerPack } from '@/types';

// 화면설계서 §9 S-EXT-MARKET, S-EXT-MARKET-DETAIL 와이어프레임 기반 목업 (F-309).
// isOwned는 mockUser(u-001) 기준 user_sticker_packs 보유 여부를 가정합니다.

export const mockStickerPacks: StickerPack[] = [
  {
    id: 'pack-001',
    name: '기본 감정 팩',
    category: 'emotion',
    thumbnailUrl: '/mock/sticker-emotion.svg',
    price: 0,
    stickerCount: 12,
    previewEmojis: ['💖', '😂', '😭', '👏'],
    isOwned: true,
  },
  {
    id: 'pack-002',
    name: '벚꽃 다이어리',
    category: 'season',
    thumbnailUrl: '/mock/sticker-season.svg',
    price: 1500,
    stickerCount: 16,
    previewEmojis: ['🌸', '🌷', '☀️', '🍃'],
    isOwned: true,
  },
  {
    id: 'pack-003',
    name: '모먼토 프렌즈',
    category: 'character',
    thumbnailUrl: '/mock/sticker-character.svg',
    price: 2500,
    stickerCount: 20,
    previewEmojis: ['🐻', '🐰', '🦊', '🐱'],
    isOwned: false,
  },
  {
    id: 'pack-004',
    name: '연말 한정 스페셜',
    category: 'special',
    thumbnailUrl: '/mock/sticker-special.svg',
    price: 3000,
    stickerCount: 10,
    previewEmojis: ['🎄', '✨', '🎁', '❄️'],
    isOwned: false,
  },
  {
    id: 'pack-005',
    name: '여름 휴가',
    category: 'season',
    thumbnailUrl: '/mock/sticker-summer.svg',
    price: 1500,
    stickerCount: 14,
    previewEmojis: ['🏖️', '🍉', '🕶️', '🌊'],
    isOwned: false,
  },
];

export function findStickerPackById(id: string): StickerPack | undefined {
  return mockStickerPacks.find((p) => p.id === id);
}
