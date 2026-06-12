'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

// 링크 복사 클릭 인터랙션만 분리한 leaf 클라이언트 컴포넌트 (clipboard API는 브라우저 전용)
export function InviteActions({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://momento.app/invite/${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한 없는 환경 — 무시 (UI는 토스트로 대체 예정)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Button size="lg">💬 카카오톡으로 보내기</Button>
      <Button variant="secondary" size="lg" onClick={copyLink}>
        {copied ? '복사됨 ✓' : '🔗 링크 복사'}
      </Button>
      <Button variant="ghost">🔄 새 코드 발급</Button>
    </div>
  );
}
