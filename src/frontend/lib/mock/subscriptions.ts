import type { Order, Subscription } from '@/types';

// 화면설계서 §9 S-EXT-SUBSCRIBE, S-EXT-CHECKOUT-RESULT 와이어프레임 기반 목업 (F-705).
// 데이터베이스설계서(#12) subscriptions(1:1 user)·orders(1:N user) 구조를 따릅니다.

export const mockSubscription: Subscription = {
  plan: 'free',
  status: 'active',
  autoRenew: false,
};

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    plan: 'pro',
    amount: 4900,
    status: 'paid',
    paymentKey: 'toss_test_paymentkey_001',
    createdAt: '2026-04-01T10:12:00+09:00',
  },
  {
    id: 'ord-002',
    plan: 'pro',
    amount: 4900,
    status: 'paid',
    paymentKey: 'toss_test_paymentkey_002',
    createdAt: '2026-05-01T10:05:00+09:00',
  },
];

export function findOrderById(id: string): Order | undefined {
  return mockOrders.find((o) => o.id === id);
}
