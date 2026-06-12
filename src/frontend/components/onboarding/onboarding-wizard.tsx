'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

// SCR-ID: S-COMMON-ONBOARDING — 화면설계서 §3.2, 3단계 위저드.
// 단계 전환·입력 상태가 필요해 클라이언트 컴포넌트로 분리 (부모 page.tsx는 <Suspense> 래핑).
export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');

  if (step === 1) {
    return (
      <Step>
        <h1 className="text-h1 text-text-primary">반가워요! 👋</h1>
        <p className="mt-1 text-body text-text-secondary">뭐라고 부를까요?</p>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (2~20자)"
          maxLength={20}
          className="mt-6 h-11 w-full rounded-button border border-border bg-surface-sunken px-4 text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
        <p className="mt-1.5 text-caption text-text-tertiary">ⓘ 그룹원에게 표시돼요</p>
        <Button className="mt-8" size="lg" disabled={nickname.trim().length < 2} onClick={() => setStep(2)}>
          다음 →
        </Button>
      </Step>
    );
  }

  if (step === 2) {
    return (
      <Step>
        <h1 className="text-h1 text-text-primary">우리만의 캘린더를 시작해볼까요?</h1>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => router.push('/g/new')}
            className="rounded-card border-2 border-primary bg-primary-light px-4 py-4 text-left text-body-strong text-primary-dark"
          >
            + 새 그룹 만들기
          </button>
          <button
            onClick={() => router.push('/join')}
            className="rounded-card border border-border bg-surface px-4 py-4 text-left text-body-strong text-text-primary"
          >
            🔗 초대 코드 입력
          </button>
        </div>
        <Button variant="ghost" className="mt-6" onClick={() => setStep(3)}>
          건너뛰기
        </Button>
      </Step>
    );
  }

  return (
    <Step>
      <h1 className="text-h1 text-text-primary">📱 홈 화면에 추가하면 앱처럼 사용할 수 있어요</h1>
      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg">📱 설치하기</Button>
        <Button size="lg">🔔 알림 받기</Button>
      </div>
      <Button variant="ghost" className="mt-6" onClick={() => router.push('/home')}>
        나중에 →
      </Button>
    </Step>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      {children}
      <div className="mt-10 flex justify-center gap-1.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span key={n} className="h-1.5 w-6 rounded-pill bg-border" />
        ))}
      </div>
    </div>
  );
}
