import { cn } from '@/lib/utils';
import type { ToastVariant } from '@/types/ui';

interface ToastProgressBarProps {
  type: ToastVariant;
}

export function ToastProgressBar({ type }: ToastProgressBarProps) {
  const colorMap = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  } as const;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800">
      <div
        className={cn('h-full transition-all ease-linear', colorMap[type])}
        style={{
          width: '0%',
          animation: 'toast-progress 4s linear forwards',
        }}
      />
    </div>
  );
}
