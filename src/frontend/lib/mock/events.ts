import fs from 'fs';
import path from 'path';
import type { CalendarEvent, MapPin, Reaction } from '@/types';

// 화면설계서 §5.1 S-CAL-MONTH, §6.2 S-EVENT-DETAIL, §6.4 S-EVENT-EDITOR 와이어프레임 기반 목업.

const onionCafe: MapPin = {
  id: 'pin-001',
  name: '어니언 성수',
  address: '서울 성동구 성수동',
  lat: 37.5446,
  lng: 127.0559,
  visitCount: 3,
  lastVisitedAt: '2026-05-30',
};

export const mockEvents: CalendarEvent[] = [
  {
    id: 'e-001',
    groupId: 'g-001',
    title: '어니언 카페 투어',
    startAt: '2026-05-30T14:00:00+09:00',
    endAt: '2026-05-30T17:00:00+09:00',
    isAllDay: false,
    isPrivate: false,
    location: onionCafe,
    memo: '도착하면 메뉴 사진부터 찍기로 약속!',
    authorId: 'u-001',
    authorNickname: '지우',
    colorIndex: 1,
    reactions: [
      { type: 'heart', count: 3, reactedByMe: true },
      { type: 'clap', count: 1, reactedByMe: false },
      { type: 'laugh', count: 2, reactedByMe: false },
      { type: 'sob', count: 0, reactedByMe: false },
      { type: 'wow', count: 0, reactedByMe: false },
      { type: 'fire', count: 0, reactedByMe: false },
    ],
    comments: [
      { id: 'c-001', authorId: 'u-002', authorNickname: '서연', content: '꼭 가자!', createdAt: '5분 전' },
      { id: 'c-002', authorId: 'u-003', authorNickname: '민호', content: '콜!', createdAt: '3분 전' },
    ],
    decorations: [
      { id: 'd-001', type: 'sticker', x: 40, y: 20, rotation: -8, scale: 1, content: '💖' },
      { id: 'd-002', type: 'photo', x: 100, y: 120, rotation: 2, scale: 1, content: '/mock/photo-cafe.svg' },
      { id: 'd-003', type: 'map', x: 60, y: 320, rotation: 0, scale: 1, content: '어니언 성수' },
      { id: 'd-004', type: 'text', x: 140, y: 420, rotation: -3, scale: 1, content: '오늘 너무 좋았어!' },
    ],
    thumbnailUrl: '/mock/thumb-onion.svg',
    baseVersion: 3,
  },
  {
    id: 'e-002',
    groupId: 'g-001',
    title: '한강 피크닉',
    startAt: '2026-05-13T11:00:00+09:00',
    endAt: '2026-05-13T15:00:00+09:00',
    isAllDay: false,
    isPrivate: false,
    memo: '돗자리, 블루투스 스피커 챙기기',
    authorId: 'u-002',
    authorNickname: '서연',
    colorIndex: 2,
    reactions: [
      { type: 'heart', count: 5, reactedByMe: false },
      { type: 'clap', count: 0, reactedByMe: false },
      { type: 'laugh', count: 0, reactedByMe: false },
      { type: 'sob', count: 0, reactedByMe: false },
      { type: 'wow', count: 1, reactedByMe: false },
      { type: 'fire', count: 0, reactedByMe: false },
    ],
    comments: [],
    decorations: [],
    baseVersion: 1,
  },
  {
    id: 'e-003',
    groupId: 'g-001',
    title: '지우 생일파티 🎂',
    startAt: '2026-05-05T18:00:00+09:00',
    endAt: '2026-05-05T21:00:00+09:00',
    isAllDay: false,
    isPrivate: false,
    authorId: 'u-004',
    authorNickname: '수아',
    colorIndex: 3,
    reactions: [
      { type: 'heart', count: 8, reactedByMe: true },
      { type: 'clap', count: 4, reactedByMe: true },
      { type: 'laugh', count: 0, reactedByMe: false },
      { type: 'sob', count: 0, reactedByMe: false },
      { type: 'wow', count: 2, reactedByMe: false },
      { type: 'fire', count: 1, reactedByMe: false },
    ],
    comments: [
      { id: 'c-003', authorId: 'u-001', authorNickname: '지우', content: '다들 고마워 ㅠㅠ', createdAt: '2주 전' },
    ],
    decorations: [],
    baseVersion: 2,
  },
];

export const mockMapPins: MapPin[] = [
  onionCafe,
  { id: 'pin-002', name: '한강공원 망원지구', address: '서울 마포구 망원동', lat: 37.5547, lng: 126.8973, visitCount: 2, lastVisitedAt: '2026-05-13' },
  { id: 'pin-003', name: '연남동 브런치 카페', address: '서울 마포구 연남동', lat: 37.5636, lng: 126.9251, visitCount: 1, lastVisitedAt: '2026-04-22' },
];

// Supabase events 테이블 미구축(M1) 동안의 파일 기반 폴백 저장소.
// Next.js는 라우트마다 모듈을 별도로 번들링해 인메모리 배열을 공유하지 못하므로,
// API Route에서 생성/수정한 일정은 .data/events-store.json에 적재하고
// findEventsByGroupId/findEventById에서 이 파일과 mockEvents를 병합해 반환한다.
const STORE_PATH = path.join(process.cwd(), '.data', 'events-store.json');

function readStore(): CalendarEvent[] {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeStore(events: CalendarEvent[]): void {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(events, null, 2));
}

export function findEventsByGroupId(groupId: string): CalendarEvent[] {
  const store = readStore();
  const overrides = new Map(store.map((e) => [e.id, e]));
  const seed = mockEvents.map((e) => overrides.get(e.id) ?? e);
  const added = store.filter((e) => !mockEvents.some((m) => m.id === e.id));
  return [...added, ...seed].filter((e) => e.groupId === groupId);
}

export function findEventById(id: string): CalendarEvent | undefined {
  return readStore().find((e) => e.id === id) ?? mockEvents.find((e) => e.id === id);
}

export function addEvent(event: CalendarEvent): void {
  const store = readStore();
  store.unshift(event);
  writeStore(store);
}

export function updateEvent(id: string, patch: Partial<CalendarEvent>): CalendarEvent | undefined {
  const store = readStore();
  const existing = store.find((e) => e.id === id) ?? mockEvents.find((e) => e.id === id);
  if (!existing) return undefined;

  const updated = { ...existing, ...patch };
  const index = store.findIndex((e) => e.id === id);
  if (index === -1) store.push(updated);
  else store[index] = updated;
  writeStore(store);
  return updated;
}

export function emptyReactions(): Reaction[] {
  return (['heart', 'clap', 'laugh', 'sob', 'wow', 'fire'] as const).map((type) => ({
    type,
    count: 0,
    reactedByMe: false,
  }));
}
