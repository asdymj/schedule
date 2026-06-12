// 모먼토(Momento) 도메인 타입 정의
// 화면설계서(#9) §13 화면-기능-API 매핑 및 API스펙(#7)을 기준으로 한 프론트엔드 표시용 타입.
// Supabase 연동 전까지는 lib/mock의 더미 데이터가 이 타입을 따릅니다.

export type GroupColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type GroupType = 'friend' | 'couple' | 'family' | 'club';

export interface Member {
  id: string;
  nickname: string;
  avatarUrl?: string;
  colorIndex: GroupColor;
  role: 'owner' | 'admin' | 'member';
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  icon: string;
  colorIndex: GroupColor;
  memberCount: number;
  members: Member[];
  recentActivity?: string;
  recentActivityAt?: string;
}

export type ReactionType = 'heart' | 'clap' | 'laugh' | 'sob' | 'wow' | 'fire';

export interface Reaction {
  type: ReactionType;
  count: number;
  reactedByMe: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
}

export interface MapPin {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitCount: number;
  lastVisitedAt: string;
}

export type DecorationNodeType = 'photo' | 'map' | 'video' | 'text' | 'sticker';

export interface DecorationNode {
  id: string;
  type: DecorationNodeType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  content: string; // photo URL / map place name / video URL / text content / sticker emoji
}

export interface CalendarEvent {
  id: string;
  groupId: string;
  title: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  isPrivate: boolean;
  location?: MapPin;
  memo?: string;
  authorId: string;
  authorNickname: string;
  colorIndex: GroupColor;
  reactions: Reaction[];
  comments: Comment[];
  decorations: DecorationNode[];
  thumbnailUrl?: string;
  baseVersion: number;
}

export type NotificationType = 'reminder' | 'comment' | 'reaction' | 'member_joined' | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'pro' | 'family';
}

export interface InviteCode {
  code: string;
  groupId: string;
  expiresAt: string;
  used: boolean;
}

// F-309 프리미엄 스티커 마켓 (S-EXT-MARKET) — 데이터베이스설계서(#12) user_sticker_packs 기준.
// 팩 카탈로그 자체는 정적 콘텐츠이며, isOwned는 user_sticker_packs 보유 여부를 반영합니다.
export type StickerPackCategory = 'emotion' | 'season' | 'character' | 'special';

export interface StickerPack {
  id: string;
  name: string;
  category: StickerPackCategory;
  thumbnailUrl: string;
  price: number; // KRW, 0 = 무료
  stickerCount: number;
  previewEmojis: string[];
  isOwned: boolean;
}

// F-705 결제/구독 관리 (S-EXT-SUBSCRIBE/CHECKOUT) — 데이터베이스설계서(#12) subscriptions/orders 기준.
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export interface Subscription {
  plan: User['plan'];
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  autoRenew: boolean;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'canceled';

export interface Order {
  id: string;
  plan: User['plan'];
  amount: number;
  status: OrderStatus;
  paymentKey?: string;
  createdAt: string;
}
