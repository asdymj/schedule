'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

// SCR-ID: S-GROUP-ACCEPT — 화면설계서 §4.4 (/join?code=)
// 초대 코드를 입력받아 /invite/:code(만료·존재 여부 검증)로 이동시키는 leaf 클라이언트 컴포넌트.
export function JoinCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState('');

  function submit() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) return;
    router.push(`/invite/${trimmed}`);
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="예: A1B2C3"
        maxLength={6}
        autoCapitalize="characters"
        className="h-12 w-full rounded-button border border-border bg-surface-sunken px-4 text-center text-display tracking-[0.2em] text-text-primary placeholder:text-text-tertiary placeholder:tracking-[0.2em] focus:border-primary focus:outline-none"
      />
      <Button size="lg" disabled={code.length !== 6} onClick={submit}>
        참여하기
      </Button>
    </div>
  );
}
