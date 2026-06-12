'use client';

import { useState } from 'react';
import type { Comment } from '@/types';
import { Send } from 'lucide-react';

// 화면설계서 §6.2 댓글 영역 — 입력 폼은 Optimistic UI로 즉시 추가. leaf 클라이언트 컴포넌트.
export function CommentList({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setComments((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, authorId: 'me', authorNickname: '나', content: trimmed, createdAt: '방금 전' },
    ]);
    setDraft('');
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-h3 text-text-primary">💬 댓글 ({comments.length})</p>
      <ul className="flex flex-col gap-2">
        {comments.map((c) => (
          <li key={c.id} className="text-body-sm">
            <span className="font-semibold text-text-primary">{c.authorNickname}</span>{' '}
            <span className="text-text-primary">&ldquo;{c.content}&rdquo;</span>{' '}
            <span className="text-caption text-text-tertiary">{c.createdAt}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex items-center gap-2 rounded-card border border-border bg-surface-sunken px-3 py-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="@ 멘션 가능..."
          className="flex-1 bg-transparent text-body-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          aria-label="댓글 입력"
        />
        <button type="submit" aria-label="댓글 전송" className="text-primary disabled:text-text-tertiary" disabled={!draft.trim()}>
          <Send size={20} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
