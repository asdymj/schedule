// orders + subscriptions(#12 §3, §7) 리포지토리 — F-705 결제/구독 관리
// (P-402 원본 'order' 리포지토리. 'cart'는 모먼토에 단건 결제(플랜/스티커팩)만 존재하여 생략)
// 지금은 목업 구현이며, 함수 시그니처는 실습6에서 Supabase SDK 쿼리로 교체될 때 동일하게 유지됩니다.

export type PlanType = 'free' | 'pro' | 'family';

export interface SubscriptionRow {
  user_id: string;
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string | null;
  auto_renew: boolean;
}

export interface OrderRow {
  id: string;
  user_id: string;
  plan: PlanType;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  payment_key: string | null;
  created_at: string;
}

const mockSubscriptions: SubscriptionRow[] = [
  { user_id: 'u-001', plan: 'free', status: 'active', current_period_end: null, auto_renew: false },
];

const mockOrders: OrderRow[] = [
  { id: 'ord-001', user_id: 'u-001', plan: 'pro', amount: 4900, status: 'paid', payment_key: 'toss_test_paymentkey_001', created_at: '2026-04-01T10:12:00+09:00' },
  { id: 'ord-002', user_id: 'u-001', plan: 'pro', amount: 4900, status: 'paid', payment_key: 'toss_test_paymentkey_002', created_at: '2026-05-01T10:05:00+09:00' },
];

// GET /api/me/subscription
export async function getSubscriptionByUserId(userId: string): Promise<SubscriptionRow> {
  return (
    mockSubscriptions.find((s) => s.user_id === userId) ?? {
      user_id: userId,
      plan: 'free',
      status: 'active',
      current_period_end: null,
      auto_renew: false,
    }
  );
}

export async function upsertSubscription(
  userId: string,
  patch: Partial<Omit<SubscriptionRow, 'user_id'>>,
): Promise<SubscriptionRow> {
  let sub = mockSubscriptions.find((s) => s.user_id === userId);
  if (!sub) {
    sub = { user_id: userId, plan: 'free', status: 'active', current_period_end: null, auto_renew: false };
    mockSubscriptions.push(sub);
  }
  Object.assign(sub, patch);
  return sub;
}

export async function listOrdersByUserId(userId: string): Promise<OrderRow[]> {
  return mockOrders.filter((o) => o.user_id === userId);
}

export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  return mockOrders.find((o) => o.id === orderId) ?? null;
}

// POST /api/payments/checkout — pending 주문 생성
export async function createOrder(input: { userId: string; plan: PlanType; amount: number }): Promise<OrderRow> {
  const order: OrderRow = {
    id: `ord-${String(mockOrders.length + 1).padStart(3, '0')}`,
    user_id: input.userId,
    plan: input.plan,
    amount: input.amount,
    status: 'pending',
    payment_key: null,
    created_at: new Date().toISOString(),
  };
  mockOrders.push(order);
  return order;
}

// POST /api/payments/confirm — 멱등성 보장: 이미 paid면 idempotent하게 기존 행 반환
export async function markOrderPaid(orderId: string, paymentKey: string): Promise<OrderRow | null> {
  const order = mockOrders.find((o) => o.id === orderId);
  if (!order) return null;
  if (order.status === 'paid') return order;

  order.status = 'paid';
  order.payment_key = paymentKey;
  await upsertSubscription(order.user_id, { plan: order.plan, status: 'active', auto_renew: true });
  return order;
}
