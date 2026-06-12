import { cn } from '@/lib/utils';
import type { GroupColor } from '@/types';

// 디자인가이드 §6.8 아바타 — xs/sm/md/lg, 원형, 그룹 색상 링, fallback 이니셜
const SIZE_CLASS = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-caption',
  md: 'w-10 h-10 text-body-sm',
  lg: 'w-16 h-16 text-h3',
} as const;

export function Avatar({
  nickname,
  colorIndex = 1,
  size = 'md',
  ring = false,
  className,
}: {
  nickname: string;
  colorIndex?: GroupColor;
  size?: keyof typeof SIZE_CLASS;
  ring?: boolean;
  className?: string;
}) {
  // Tailwind JIT는 동적 클래스명(`bg-group-${n}`)을 추출하지 못하므로 CSS 변수를 인라인으로 적용합니다.
  const groupColorVar = `var(--color-group-${colorIndex})`;
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-pill font-semibold text-white shrink-0',
        SIZE_CLASS[size],
        className,
      )}
      style={{
        backgroundColor: groupColorVar,
        boxShadow: ring ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${groupColorVar}` : undefined,
      }}
      aria-label={nickname}
    >
      {nickname.slice(0, 1)}
    </div>
  );
}
