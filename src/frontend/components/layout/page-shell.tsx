import { cn } from '@/lib/utils';
import { BottomTab } from './bottom-tab';

// 모바일 1컬럼 + Bottom Tab 여백을 공통 처리하는 페이지 셸. 서버 컴포넌트.
export function PageShell({
  children,
  withBottomTab = true,
  className,
}: {
  children: React.ReactNode;
  withBottomTab?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto min-h-screen w-full max-w-[1080px]', withBottomTab && 'pb-16', className)}>
      {children}
      {withBottomTab && <BottomTab />}
    </div>
  );
}
