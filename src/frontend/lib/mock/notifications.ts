import type { InviteCode, NotificationItem } from '@/types';

// 화면설계서 §8.1 S-NOTIFY-CENTER, §4.3 S-GROUP-INVITE 와이어프레임 기반 목업.

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n-001',
    type: 'reminder',
    title: '30분 후',
    body: '어니언 카페 투어가 곧 시작해요',
    isRead: false,
    createdAt: '3분 전',
    linkTo: '/g/g-001/e/e-001',
  },
  {
    id: 'n-002',
    type: 'comment',
    title: '서연님이 댓글',
    body: '"꼭 가자!"',
    isRead: false,
    createdAt: '1시간 전',
    linkTo: '/g/g-001/e/e-001',
  },
  {
    id: 'n-003',
    type: 'member_joined',
    title: '민호님이 합류했어요',
    body: '절친 4인방 그룹에 새 멤버가 들어왔어요',
    isRead: true,
    createdAt: '어제',
    linkTo: '/g/g-001/members',
  },
];

export const mockInviteCode: InviteCode = {
  code: 'A1B2C3',
  groupId: 'g-001',
  expiresAt: '2026-06-08T00:00:00+09:00',
  used: false,
};

export function unreadCount(): number {
  return mockNotifications.filter((n) => !n.isRead).length;
}
