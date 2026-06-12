import { redirect } from 'next/navigation';

// 루트(/) 진입 시 로그인 화면(S-COMMON-LOGIN)으로 리다이렉트.
// 로그인 여부에 따른 분기(예: 세션 있으면 /home)는 미들웨어/세션 연동 후 보강 가능.
export default function RootPage() {
  redirect('/login');
}
