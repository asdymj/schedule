import { cn } from '@/lib/utils';

// 디자인가이드(#13) §6.1 버튼 — variant 4종, 높이 sm/md/lg, radius-button(12px)
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-text-on-primary hover:bg-primary-dark',
  secondary: 'bg-surface text-primary border border-primary hover:bg-primary-light',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-sunken',
  danger: 'bg-danger text-white hover:opacity-90',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-body-sm',
  md: 'h-11 px-5 text-body-strong',
  lg: 'h-14 px-6 text-body-strong w-full',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-button font-semibold transition-colors duration-fast ease-out active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  );
}
