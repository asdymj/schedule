'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Video, Type, Sticker, Undo2, Redo2, ChevronDown } from 'lucide-react';
import type { DecorationNode, DecorationNodeType } from '@/types';
import { cn } from '@/lib/utils';

const TOOLS: { type: DecorationNodeType; icon: typeof Camera; label: string }[] = [
  { type: 'photo', icon: Camera, label: '사진' },
  { type: 'map', icon: MapPin, label: '지도' },
  { type: 'video', icon: Video, label: '영상' },
  { type: 'text', icon: Type, label: '텍스트' },
  { type: 'sticker', icon: Sticker, label: '스티커' },
];

const STICKERS = ['💖', '⭐', '🎉', '☕', '🌿', '📍'];

// SCR-ID: S-EVENT-EDITOR — 화면설계서 §6.4 캔버스 에디터(핵심)
// 풀스크린·드래그·undo/redo·자동저장 인디케이터 — 전체가 인터랙션이므로 페이지 자체가 'use client' leaf.
// 8.5:11 비율 캔버스 위에 노드를 배치/이동하는 단순화 구현 (실제 자유 회전·크기조절은 후속 P2).
export function CanvasEditor({
  groupId,
  eventId,
  eventTitle,
  initialNodes,
}: {
  groupId: string;
  eventId: string;
  eventTitle: string;
  initialNodes: DecorationNode[];
}) {
  const router = useRouter();
  const [history, setHistory] = useState<DecorationNode[][]>([initialNodes]);
  const [cursor, setCursor] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState(true);

  const nodes = history[cursor];
  const canUndo = cursor > 0;
  const canRedo = cursor < history.length - 1;

  function commit(next: DecorationNode[]) {
    const trimmed = history.slice(0, cursor + 1);
    setHistory([...trimmed, next]);
    setCursor(trimmed.length);
    setSaved(false);
    setTimeout(() => setSaved(true), 600); // 자동 저장 인디케이터 (목업: 디바운스 후 '저장됨' 표시)
  }

  function addNode(type: DecorationNodeType, content: string) {
    const node: DecorationNode = {
      id: `local-${Date.now()}`,
      type,
      x: 30 + Math.random() * 30,
      y: 30 + Math.random() * 30,
      rotation: 0,
      scale: 1,
      content,
    };
    commit([...nodes, node]);
    setSelectedId(node.id);
    setPickerOpen(false);
  }

  function moveNode(id: string, dx: number, dy: number) {
    commit(
      nodes.map((n) => (n.id === id ? { ...n, x: clamp(n.x + dx), y: clamp(n.y + dy) } : n)),
    );
  }

  function pickTool(type: DecorationNodeType) {
    if (type === 'sticker') {
      setPickerOpen((open) => !open);
      return;
    }
    setPickerOpen(false);
    if (type === 'photo') addNode('photo', '🖼️');
    if (type === 'map') addNode('map', '📍 새 장소');
    if (type === 'video') addNode('video', '▶️');
    if (type === 'text') addNode('text', '오늘 너무 좋았어!');
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-[#2A2A33]">
      <header className="flex h-14 items-center justify-between px-3 text-white">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center" aria-label="닫기">
          <ChevronDown className="rotate-90" size={24} />
        </button>
        <span className="text-body-strong">{eventTitle}</span>
        <span className="text-body-sm text-white/70" role="status">
          {saved ? '저장됨 ✓' : '저장 중…'}
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-4">
        <div
          className="relative w-full max-w-md overflow-hidden rounded-card bg-[#FFFDF8] shadow-modal"
          style={{ aspectRatio: '8.5 / 11' }}
          onClick={() => setSelectedId(null)}
        >
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(node.id);
              }}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 select-none rounded-card transition-shadow',
                selectedId === node.id && 'ring-2 ring-primary ring-offset-2',
              )}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <DecorationContent node={node} />
            </button>
          ))}

          {nodes.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-body-sm text-text-tertiary">
              아래 도구로 사진, 지도, 스티커를 추가해 오늘을 꾸며보세요
            </p>
          )}
        </div>
      </div>

      {selectedId && (
        <div className="flex items-center justify-center gap-3 pb-2">
          <NudgeButton label="왼쪽으로" onClick={() => moveNode(selectedId, -4, 0)}>←</NudgeButton>
          <NudgeButton label="위로" onClick={() => moveNode(selectedId, 0, -4)}>↑</NudgeButton>
          <NudgeButton label="아래로" onClick={() => moveNode(selectedId, 0, 4)}>↓</NudgeButton>
          <NudgeButton label="오른쪽으로" onClick={() => moveNode(selectedId, 4, 0)}>→</NudgeButton>
        </div>
      )}

      {pickerOpen && (
        <div className="flex justify-center gap-3 border-t border-white/10 px-4 py-3">
          {STICKERS.map((s) => (
            <button
              key={s}
              onClick={() => addNode('sticker', s)}
              className="flex h-11 w-11 items-center justify-center rounded-pill bg-white/10 text-h2"
              aria-label={`스티커 ${s} 추가`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2.5">
        <div className="flex gap-1">
          <button onClick={() => canUndo && setCursor((c) => c - 1)} disabled={!canUndo} className="flex h-11 w-11 items-center justify-center rounded-pill text-white disabled:opacity-30" aria-label="실행 취소">
            <Undo2 size={20} />
          </button>
          <button onClick={() => canRedo && setCursor((c) => c + 1)} disabled={!canRedo} className="flex h-11 w-11 items-center justify-center rounded-pill text-white disabled:opacity-30" aria-label="다시 실행">
            <Redo2 size={20} />
          </button>
        </div>
        <div className="flex gap-1">
          {TOOLS.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => pickTool(type)}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-pill text-white',
                pickerOpen && type === 'sticker' && 'bg-white/15',
              )}
              aria-label={`${label} 추가`}
            >
              <Icon size={20} strokeWidth={1.75} />
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push(`/g/${groupId}/e/${eventId}`)}
          className="rounded-pill bg-primary px-4 py-2 text-body-sm font-semibold text-text-on-primary"
        >
          완료
        </button>
      </div>
    </div>
  );
}

function clamp(v: number) {
  return Math.min(92, Math.max(8, v));
}

function NudgeButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-pill bg-white/10 text-white">
      {children}
    </button>
  );
}

function DecorationContent({ node }: { node: DecorationNode }) {
  switch (node.type) {
    case 'photo':
      return node.content.startsWith('/') || node.content.startsWith('http') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.content}
          alt=""
          className="h-20 w-20 rounded-card object-cover shadow-card"
        />
      ) : (
        <span className="flex h-20 w-20 items-center justify-center rounded-card bg-surface-sunken text-3xl">{node.content}</span>
      );
    case 'video':
      return <span className="flex h-16 w-24 items-center justify-center rounded-card bg-black/80 text-2xl text-white">{node.content}</span>;
    case 'map':
      return (
        <span className="flex items-center gap-1 rounded-pill border border-border bg-surface px-3 py-1.5 text-body-sm text-text-primary">
          {node.content}
        </span>
      );
    case 'text':
      return (
        <span className="block max-w-[160px] rounded-card bg-accent/30 px-3 py-2 text-body-sm text-text-primary shadow-card">
          {node.content}
        </span>
      );
    case 'sticker':
    default:
      return <span className="text-h1">{node.content}</span>;
  }
}
