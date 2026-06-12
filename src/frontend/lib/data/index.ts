import type {
  CalendarEvent,
  Comment,
  Group,
  GroupColor,
  InviteCode,
  MapPin,
  Member,
  NotificationItem,
  Order,
  OrderStatus,
  Reaction,
  StickerPack,
  Subscription,
  SubscriptionStatus,
  User,
} from '@/types';
import { findEventById, findEventsByGroupId, mockEvents, mockMapPins } from '@/lib/mock/events';
import { findGroupById, mockGroups, mockUser } from '@/lib/mock/groups';
import { mockInviteCode, mockNotifications, unreadCount } from '@/lib/mock/notifications';
import { mockStickerPacks } from '@/lib/mock/stickers';
import { findOrderById, mockOrders, mockSubscription } from '@/lib/mock/subscriptions';
import { supabaseServer } from '@/lib/supabase/server';
import { getSessionUser, createSessionClient } from '@/lib/supabase/server-session';

// 데이터 접근 추상화 계층 (lib/data)
//
// 데이터베이스설계서(#12) 완료에 따라 Supabase 실제 쿼리로 연결합니다 (서버 전용 service_role
// 클라이언트 — RLS는 그룹/사용자 식별이 필요한 클라이언트 경로에서 적용, 서버 컴포넌트의 신뢰된
// 읽기는 M1~M4 통합 모델에서 service_role로 처리). 마이그레이션/시드(#12 §8)가 아직 적용되지
// 않아 테이블이 비어있거나 없을 수 있으므로, 쿼리 실패·빈 결과 시 목업 데이터로 폴백합니다 —
// 화면은 항상 정상 동작하고, 실제 DB에 데이터가 채워지는 즉시 자동으로 라이브 데이터로 전환됩니다.
//
// getCurrentUser/getMyGroups/getNotifications 등 "현재 로그인 사용자" 식별이 필요한 함수는
// lib/supabase/server-session.ts(쿠키 기반 세션 클라이언트, RLS 적용)로 조회합니다.
// 로그인하지 않은 상태(세션 없음)이거나 profiles 행이 아직 없는 경우에는 목업으로 폴백합니다.

const GROUP_COLOR_HEX: Record<GroupColor, string> = {
  1: '#FF8FA3',
  2: '#B5A3FF',
  3: '#FFD66B',
  4: '#6BD6B5',
  5: '#7EC8FF',
  6: '#FFB48F',
  7: '#FF8FC8',
  8: '#A8C686',
};

function colorIndexFromHex(hex?: string | null): GroupColor {
  const entry = (Object.entries(GROUP_COLOR_HEX) as [string, string][]).find(
    ([, h]) => h.toLowerCase() === (hex ?? '').toLowerCase(),
  );
  return entry ? (Number(entry[0]) as GroupColor) : 1;
}

function mapMember(row: { user_id: string; role: string; profiles: { nickname: string; avatar_url: string | null } | null }, colorIndex: GroupColor): Member {
  return {
    id: row.user_id,
    nickname: row.profiles?.nickname ?? '(알 수 없음)',
    avatarUrl: row.profiles?.avatar_url ?? undefined,
    colorIndex,
    role: (row.role as Member['role']) ?? 'member',
  };
}

function mapGroup(row: any): Group {
  const colorIndex = colorIndexFromHex(row.color);
  const members: Member[] = (row.group_members ?? []).map((m: any) => mapMember(m, colorIndex));
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    colorIndex,
    memberCount: members.length,
    members,
  };
}

function mapReactions(rows: { type: string }[]): Reaction[] {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
  return Array.from(counts.entries()).map(([type, count]) => ({
    type: type as Reaction['type'],
    count,
    reactedByMe: false, // 본인 리액션 여부는 인증 세션 연동 후 판별 (현재는 비표시)
  }));
}

function mapComment(row: any): Comment {
  return {
    id: row.id,
    authorId: row.author_id ?? '',
    authorNickname: row.profiles?.nickname ?? '(탈퇴 사용자)',
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapEvent(row: any): CalendarEvent {
  const location: MapPin | undefined = row.location
    ? {
        id: row.id,
        name: row.location.name ?? '',
        address: row.location.address ?? '',
        lat: row.location.lat ?? 0,
        lng: row.location.lng ?? 0,
        visitCount: 1,
        lastVisitedAt: row.start_at,
      }
    : undefined;

  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at ?? row.start_at,
    isAllDay: row.is_all_day,
    isPrivate: row.is_private,
    location,
    memo: row.memo ?? undefined,
    authorId: row.author_id ?? '',
    authorNickname: row.profiles?.nickname ?? '(탈퇴 사용자)',
    colorIndex: colorIndexFromHex(row.color) || 1,
    reactions: mapReactions(row.event_reactions ?? []),
    comments: (row.event_comments ?? []).map(mapComment),
    decorations: row.event_decorations?.canvas_state?.nodes ?? [],
    thumbnailUrl: row.media?.[0]?.thumbnail_url ?? undefined,
    baseVersion: row.event_decorations?.version ?? 1,
  };
}

export async function getCurrentUser(): Promise<User> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return mockUser;

  const client = createSessionClient();
  const { data, error } = await client!
    .from('profiles')
    .select('id, nickname, avatar_url, email, plan')
    .eq('id', sessionUser.id)
    .maybeSingle();
  if (error || !data) return mockUser;

  return {
    id: data.id,
    nickname: data.nickname,
    email: data.email,
    avatarUrl: data.avatar_url ?? undefined,
    plan: (data.plan as User['plan']) ?? 'free',
  };
}

export async function getMyGroups(): Promise<Group[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return mockGroups;

  const client = createSessionClient();
  const { data, error } = await client!
    .from('group_members')
    .select('groups(id, name, type, icon, color, group_members(user_id, role, profiles(nickname, avatar_url)))')
    .eq('user_id', sessionUser.id);
  if (error || !data || data.length === 0) return mockGroups;

  return data
    .map((row: any) => row.groups)
    .filter((g: any): g is NonNullable<typeof g> => Boolean(g))
    .map(mapGroup);
}

export async function getGroup(groupId: string): Promise<Group | undefined> {
  if (supabaseServer) {
    const { data, error } = await supabaseServer
      .from('groups')
      .select('id, name, type, icon, color, group_members(user_id, role, profiles(nickname, avatar_url))')
      .eq('id', groupId)
      .is('deleted_at', null)
      .maybeSingle();
    if (!error && data) return mapGroup(data);
  }
  return findGroupById(groupId);
}

export async function getGroupEvents(groupId: string): Promise<CalendarEvent[]> {
  if (supabaseServer) {
    const { data, error } = await supabaseServer
      .from('events')
      .select(
        'id, group_id, author_id, title, start_at, end_at, is_all_day, is_private, color, location, memo, ' +
          'profiles(nickname), event_reactions(type), event_comments(id, author_id, content, created_at, profiles(nickname)), ' +
          'event_decorations(canvas_state, version), media(thumbnail_url)',
      )
      .eq('group_id', groupId)
      .is('deleted_at', null)
      .order('start_at', { ascending: true });
    if (!error && data && data.length > 0) return data.map(mapEvent);
  }
  return findEventsByGroupId(groupId);
}

export async function getEvent(eventId: string): Promise<CalendarEvent | undefined> {
  if (supabaseServer) {
    const { data, error } = await supabaseServer
      .from('events')
      .select(
        'id, group_id, author_id, title, start_at, end_at, is_all_day, is_private, color, location, memo, ' +
          'profiles(nickname), event_reactions(type), event_comments(id, author_id, content, created_at, profiles(nickname)), ' +
          'event_decorations(canvas_state, version), media(thumbnail_url)',
      )
      .eq('id', eventId)
      .is('deleted_at', null)
      .maybeSingle();
    if (!error && data) return mapEvent(data);
  }
  return findEventById(eventId);
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
  return mockEvents;
}

export async function getMapPins(groupId: string): Promise<MapPin[]> {
  if (supabaseServer) {
    const { data, error } = await supabaseServer
      .from('events')
      .select('id, location, start_at')
      .eq('group_id', groupId)
      .is('deleted_at', null)
      .not('location', 'is', null);
    if (!error && data && data.length > 0) {
      const byPlace = new Map<string, MapPin>();
      for (const row of data) {
        const loc = row.location as { name?: string; address?: string; lat?: number; lng?: number } | null;
        if (!loc?.name) continue;
        const key = loc.name;
        const existing = byPlace.get(key);
        if (existing) {
          existing.visitCount += 1;
          if (row.start_at > existing.lastVisitedAt) existing.lastVisitedAt = row.start_at;
        } else {
          byPlace.set(key, {
            id: row.id,
            name: loc.name,
            address: loc.address ?? '',
            lat: loc.lat ?? 0,
            lng: loc.lng ?? 0,
            visitCount: 1,
            lastVisitedAt: row.start_at,
          });
        }
      }
      if (byPlace.size > 0) return Array.from(byPlace.values());
    }
  }
  return mockMapPins;
}

function mapNotification(row: any): NotificationItem {
  const payload = row.payload ?? {};
  return {
    id: row.id,
    type: row.type,
    title: payload.title ?? row.type,
    body: payload.body ?? '',
    isRead: row.is_read,
    createdAt: row.created_at,
    linkTo: row.deep_link ?? undefined,
  };
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return mockNotifications;

  const client = createSessionClient();
  const { data, error } = await client!
    .from('notifications')
    .select('id, type, payload, deep_link, is_read, created_at')
    .eq('user_id', sessionUser.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data || data.length === 0) return mockNotifications;

  return data.map(mapNotification);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return unreadCount();

  const client = createSessionClient();
  const { count, error } = await client!
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', sessionUser.id)
    .eq('is_read', false);
  if (error || count === null) return unreadCount();

  return count;
}

export async function getInviteCode(groupId: string): Promise<InviteCode> {
  if (supabaseServer) {
    const { data, error } = await supabaseServer
      .from('group_invites')
      .select('code, group_id, expires_at, uses, max_uses')
      .eq('group_id', groupId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      return {
        code: data.code,
        groupId: data.group_id,
        expiresAt: data.expires_at,
        used: data.uses >= data.max_uses,
      };
    }
  }
  return mockInviteCode;
}

// F-309 프리미엄 스티커 마켓 (S-EXT-MARKET). 팩 카탈로그는 정적 콘텐츠(mockStickerPacks)이며,
// user_sticker_packs(#12)에서 로그인 사용자의 보유 여부만 덮어씁니다.
export async function getStickerPacks(): Promise<StickerPack[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return mockStickerPacks;

  const client = createSessionClient();
  const { data, error } = await client!
    .from('user_sticker_packs')
    .select('pack_id')
    .eq('user_id', sessionUser.id);
  if (error || !data) return mockStickerPacks;

  const ownedIds = new Set(data.map((row) => row.pack_id));
  return mockStickerPacks.map((pack) => ({
    ...pack,
    isOwned: pack.price === 0 || ownedIds.has(pack.id),
  }));
}

export async function getStickerPack(packId: string): Promise<StickerPack | undefined> {
  const packs = await getStickerPacks();
  return packs.find((p) => p.id === packId);
}

// F-705 결제/구독 관리 (S-EXT-SUBSCRIBE). subscriptions(#12)는 user_id 1:1 행입니다.
export async function getSubscription(): Promise<Subscription> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return mockSubscription;

  const client = createSessionClient();
  const { data, error } = await client!
    .from('subscriptions')
    .select('plan, status, current_period_end, auto_renew')
    .eq('user_id', sessionUser.id)
    .maybeSingle();
  if (error || !data) return mockSubscription;

  return {
    plan: data.plan as Subscription['plan'],
    status: data.status as SubscriptionStatus,
    currentPeriodEnd: data.current_period_end ?? undefined,
    autoRenew: data.auto_renew,
  };
}

// F-705 결제 내역 (S-EXT-CHECKOUT-RESULT). orders(#12)는 user_id 1:N 행입니다.
export async function getOrders(): Promise<Order[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return mockOrders;

  const client = createSessionClient();
  const { data, error } = await client!
    .from('orders')
    .select('id, plan, amount, status, payment_key, created_at')
    .eq('user_id', sessionUser.id)
    .order('created_at', { ascending: false });
  if (error || !data || data.length === 0) return mockOrders;

  return data.map((row) => ({
    id: row.id,
    plan: row.plan as Order['plan'],
    amount: row.amount,
    status: row.status as OrderStatus,
    paymentKey: row.payment_key ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.id === orderId) ?? findOrderById(orderId);
}
