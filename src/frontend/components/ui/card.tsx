import { cn } from '@/lib/utils';

// 디자인가이드 §6.3 카드 — radius-card(8px), 보더 1px, 패딩 16px, hover 시 Level 2 그림자
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface p-4 transition-all duration-fast ease-out',
        'hover:-translate-y-0.5 hover:shadow-card',
        className,
      )}
      {...props}
    />
  );
}

export function DashedCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-card border border-dashed border-border-strong p-4 text-text-secondary',
        className,
      )}
      {...props}
    />
  );
}
