import { cn } from '@/lib/utils';

// 디자인가이드 §6.9 Skeleton — surface-sunken 베이스 + shimmer, LCP 2.5초 초과 가능 화면에 사용
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-card bg-surface-sunken', className)} />;
}

export function CalendarGridSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-1 p-2">
      {Array.from({ length: 42 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
