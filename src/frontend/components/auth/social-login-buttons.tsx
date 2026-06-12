'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

type Provider = 'kakao' | 'google' | 'apple';

const PROVIDERS: { id: Provider; label: string; className: string }[] = [
  { id: 'kakao', label: '🟡 카카오로 시작', className: 'bg-[#FEE500] text-[#1A1A1A] hover:bg-[#FEE500]/90' },
  { id: 'google', label: '🔵 Google 계속', className: '' },
  { id: 'apple', label: '⚫ Apple 계속', className: '' },
];

// SCR-ID: S-COMMON-LOGIN — 화면설계서 §3.1 / F-001 소셜 로그인
// 프로토타입 단계(M1, Supabase OAuth 프로바이더 미설정)에서는 실제 외부 인증 대신
// 목업 세션(쿠키)을 발급해 로그인 상태를 시뮬레이션합니다. 추후 Kakao/Google OAuth가
// Supabase 대시보드에서 활성화되면 이 leaf만 signInWithOAuth 호출로 교체하면 됩니다.
export function SocialLoginButtons() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const router = useRouter();

  async function signIn(provider: Provider) {
    setLoading(provider);
    document.cookie = `momento_mock_session=${provider}; path=/; max-age=${60 * 60 * 24 * 7}`;
    setTimeout(() => {
      router.push('/home');
      router.refresh();
    }, 400);
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      {PROVIDERS.map(({ id, label, className }) => (
        <Button
          key={id}
          variant={className ? 'primary' : 'secondary'}
          size="lg"
          className={className}
          disabled={loading !== null}
          onClick={() => signIn(id)}
        >
          {loading === id ? '연결 중…' : label}
        </Button>
      ))}
    </div>
  );
}
