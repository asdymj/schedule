'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin as MapPinIcon } from 'lucide-react';
import type { MapPin } from '@/types';
import { cn } from '@/lib/utils';

// 화면설계서 §7.2 — 핀 선택 인터랙션(useState)만 분리한 leaf. 실제 Kakao Map SDK 연동은 후속(REQ-072).
// 목업 단계에서는 좌표를 정규화한 위치에 핀 마커를 배치한 플레이스홀더 지도를 보여줍니다.
export function MemoryMap({ groupId, pins }: { groupId: string; pins: MapPin[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(pins[0]?.id ?? null);
  const selected = pins.find((p) => p.id === selectedId);

  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];

  function place(pin: MapPin) {
    const x = maxLng === minLng ? 50 : ((pin.lng - minLng) / (maxLng - minLng)) * 80 + 10;
    const y = maxLat === minLat ? 50 : (1 - (pin.lat - minLat) / (maxLat - minLat)) * 80 + 10;
    return { left: `${x}%`, top: `${y}%` };
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-[#E8F0E6]">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-pill bg-surface px-3 py-1.5 text-body-sm font-semibold text-text-primary shadow-card">
        <MapPinIcon size={14} className="text-primary" /> 핀 {pins.length}개
      </div>

      <div className="relative h-full w-full">
        {pins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedId(pin.id)}
            style={place(pin)}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-full text-2xl transition-transform',
              selectedId === pin.id && 'scale-125',
            )}
            aria-label={`${pin.name} 핀 선택`}
            aria-pressed={selectedId === pin.id}
          >
            📍
          </button>
        ))}
      </div>

      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-card border border-border bg-surface p-4 shadow-modal">
          <p className="text-body-strong text-text-primary">☕ {selected.name}</p>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            {selected.visitCount}번 다녀옴 · {selected.lastVisitedAt}
          </p>
          <p className="text-caption text-text-tertiary">{selected.address}</p>
          <Link
            href={`/g/${groupId}/cal/month`}
            className="mt-2 inline-block text-body-sm font-semibold text-primary"
          >
            일정 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
