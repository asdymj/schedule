import type { Metadata, Viewport } from 'next';
import './globals.css';

// 루트 레이아웃은 서버 컴포넌트. 전역 폰트·메타데이터·테마만 담당하고
// 인터랙션(테마 토글, 알림 구독 등)은 하위 클라이언트 컴포넌트에 위임합니다.

export const metadata: Metadata = {
  title: '모먼토 (Momento) — 우리만의 캘린더',
  description: '오늘의 일정을, 내일의 추억으로. 친구·연인·가족과 함께 꾸미는 폐쇄형 공유 캘린더.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF8FA3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <div className="device-frame">
          <div className="device-frame__screen">{children}</div>
        </div>
      </body>
    </html>
  );
}
