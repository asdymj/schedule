import { cn } from '@/lib/utils';

// 디자인가이드 §6.4 배지 & 태그
type SemanticTone = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

const TONE_CLASS: Record<SemanticTone, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  primary: 'bg-primary-light text-primary-dark',
  neutral: 'bg-surface-sunken text-text-secondary',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: SemanticTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-overline uppercase',
        TONE_CLASS[tone],
        className,
      )}
      {...props}
    />
  );
}

// Count Badge — 알림 카운트 등 원형 숫자 배지 (Accent 배경)
export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold text-text-primary">
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Status Dot — 미읽음 등 상태 표시 (색상 단독 사용 금지 원칙에 따라 텍스트와 함께 사용)
export function StatusDot({ tone = 'primary' }: { tone?: SemanticTone }) {
  const dotColor: Record<SemanticTone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    primary: 'bg-primary',
    neutral: 'bg-text-tertiary',
  };
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-pill', dotColor[tone])} aria-hidden />;
}
