import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/top-bar';
import { JoinCodeForm } from '@/components/group/join-code-form';

// SCR-ID: S-GROUP-ACCEPT — 화면설계서 §4.4 (/join?code=)
// 온보딩(S-COMMON-ONBOARDING) "🔗 초대 코드 입력" 진입점. code 쿼리가 있으면
// /invite/:code(만료·존재 여부 검증 화면)로 바로 이동, 없으면 코드 입력 폼을 보여준다.
export default function JoinPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = searchParams.code?.trim();
  if (code) {
    redirect(`/invite/${code.toUpperCase()}`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1080px]">
      <TopBar title="초대 코드 입력" backHref="/home" />
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <p className="text-h2 text-text-primary">🔗 초대 코드를 입력해주세요</p>
        <p className="text-body-sm text-text-secondary">
          그룹원에게 받은 6자리 코드를 입력하면
          <br />
          그룹에 참여할 수 있어요.
        </p>
        <JoinCodeForm />
      </div>
    </main>
  );
}
