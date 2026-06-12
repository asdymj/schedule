import { Suspense } from 'react';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

// SCR-ID: S-COMMON-ONBOARDING — 화면설계서 §3.2 (/onboarding?step=1|2|3)
// 서버 컴포넌트 page는 셸 역할만 하고, 클라이언트 훅(useState)을 쓰는 위저드는 Suspense로 래핑.
export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}
