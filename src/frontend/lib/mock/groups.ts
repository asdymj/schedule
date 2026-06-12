import type { Group, Member, User } from '@/types';

// 화면설계서 §3.3 S-COMMON-HOME 와이어프레임의 예시 데이터를 기반으로 한 목업.
// Supabase 연동 전까지 lib/data가 이 데이터를 그대로 반환합니다.

export const mockUser: User = {
  id: 'u-001',
  nickname: '지우',
  email: 'asdymj@gmail.com',
  plan: 'free',
};

const members: Record<string, Member> = {
  jiwoo: { id: 'u-001', nickname: '지우', colorIndex: 1, role: 'owner' },
  seoyeon: { id: 'u-002', nickname: '서연', colorIndex: 2, role: 'admin' },
  minho: { id: 'u-003', nickname: '민호', colorIndex: 5, role: 'member' },
  sua: { id: 'u-004', nickname: '수아', colorIndex: 3, role: 'member' },
  junho: { id: 'u-005', nickname: '준호', colorIndex: 8, role: 'owner' },
};

export const mockGroups: Group[] = [
  {
    id: 'g-001',
    name: '절친 4인방',
    type: 'friend',
    icon: '💖',
    colorIndex: 1,
    memberCount: 4,
    members: [members.jiwoo, members.seoyeon, members.minho, members.sua],
    recentActivity: '"어니언 카페 어때?"',
    recentActivityAt: '지금 활발',
  },
  {
    id: 'g-002',
    name: '우리둘',
    type: 'couple',
    icon: '⭐',
    colorIndex: 2,
    memberCount: 2,
    members: [members.jiwoo, members.seoyeon],
    recentActivity: '기념일 D-7 알림',
    recentActivityAt: '3시간 전',
  },
  {
    id: 'g-003',
    name: '주말 캠핑 동호회',
    type: 'club',
    icon: '🏕️',
    colorIndex: 8,
    memberCount: 12,
    members: [members.junho, members.minho, members.sua],
    recentActivity: '11월 정기 모임 일정 등록',
    recentActivityAt: '어제',
  },
];

export function findGroupById(id: string): Group | undefined {
  return mockGroups.find((g) => g.id === id);
}
