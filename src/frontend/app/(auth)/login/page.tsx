import Link from 'next/link';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';

// SCR-ID: S-COMMON-LOGIN — 화면설계서 §3.1
// 정적 텍스트는 서버 컴포넌트로 유지하고, OAuth 리다이렉트를 트리거하는 버튼만
// 클라이언트 leaf(SocialLoginButtons)로 분리 (콜백: app/auth/callback/route.ts).
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-6 text-center">
      <div>
        <p className="font-hand text-display text-primary">💖 모먼토</p>
        <p className="mt-2 text-body text-text-secondary">
          오늘의 일정을
          <br />
          내일의 추억으로
        </p>
      </div>

      <SocialLoginButtons />

      <Link href="/home" className="text-caption text-text-secondary underline underline-offset-4">
        로그인 없이 둘러보기
      </Link>

      <p className="text-caption text-text-tertiary">
        <a href="#" className="underline">서비스 이용약관</a> · <a href="#" className="underline">개인정보처리방침</a>
      </p>
    </main>
  );
}
