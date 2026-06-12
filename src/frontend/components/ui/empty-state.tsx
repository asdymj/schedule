import { Button } from './button';

// 디자인가이드 §6.9 EmptyState — 중앙 정렬, 48px 아이콘/일러스트 + H3 메시지 + Primary CTA
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && <div className="text-[48px] leading-none">{icon}</div>}
      <p className="font-hand text-h3 text-text-secondary">{title}</p>
      {description && <p className="text-body-sm text-text-tertiary">{description}</p>}
      {actionLabel && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
