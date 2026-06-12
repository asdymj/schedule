'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui';
import type { Member } from '@/types';

// SCR-ID: S-GROUP-MEMBERS — 화면설계서 §4.2. 컨텍스트 메뉴(⋯) 토글이 필요한 leaf 클라이언트 컴포넌트.
export function MemberList({ members, myId }: { members: Member[]; myId: string }) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const me = members.find((m) => m.id === myId);
  const isOwner = me?.role === 'owner';

  return (
    <ul className="flex flex-col">
      {members.map((m) => {
        const isMe = m.id === myId;
        const canManage = (isOwner || me?.role === 'admin') && !isMe && m.role !== 'owner';
        return (
          <li key={m.id} className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Avatar nickname={m.nickname} colorIndex={m.colorIndex} />
            <div className="flex-1">
              <p className="text-body-strong text-text-primary">
                {m.nickname} {isMe && <span className="text-caption text-text-tertiary">(나)</span>}
              </p>
              {m.role !== 'member' && (
                <p className="text-caption text-text-secondary">{m.role === 'owner' ? '👑 운영자' : '⭐ 관리자'}</p>
              )}
            </div>
            {canManage && (
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                  aria-label={`${m.nickname} 관리 메뉴`}
                  className="flex h-9 w-9 items-center justify-center text-text-secondary"
                >
                  <MoreHorizontal size={20} />
                </button>
                {openMenuId === m.id && (
                  <div className="absolute right-0 z-10 mt-1 w-40 rounded-card border border-border bg-surface py-1 shadow-modal">
                    {isOwner && (
                      <button className="block w-full px-3 py-2 text-left text-body-sm text-text-primary hover:bg-surface-sunken">
                        관리자 승격/강등
                      </button>
                    )}
                    <button className="block w-full px-3 py-2 text-left text-body-sm text-danger hover:bg-surface-sunken">
                      강퇴하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
