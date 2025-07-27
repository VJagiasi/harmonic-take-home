import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToastIcon } from './ToastIcon';
import { ToastProgressBar } from './ToastProgressBar';
import { animations, typography, colors, spacing } from '@/lib/constants';
import type { ToastData } from '@/types/ui';

interface ToastComponentProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

export function ToastComponent({ toast, onRemove }: ToastComponentProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'flex items-start gap-3 sm:gap-4 p-4 sm:p-6 pr-12 sm:pr-14',
        colors.surface.elevated,
        'rounded-xl sm:rounded-2xl',
        'shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)]',
        'border border-gray-100/80 dark:border-gray-800',
        'min-w-[280px] sm:min-w-[360px] max-w-[calc(100vw-2rem)] sm:max-w-md',
        'toast-enter',
        animations.lift,
        animations.colors
      )}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-transparent to-purple-600" />
      </div>

      {/* Content */}
      <div className="relative flex items-start gap-4 flex-1">
        <ToastIcon type={toast.type} />

        <div className={cn('flex-1 min-w-0', spacing.stack.xs)}>
          <p
            className={cn(
              typography.label,
              colors.text.primary,
              'font-semibold tracking-tight text-sm sm:text-base'
            )}
          >
            {toast.title}
          </p>
          {toast.description && (
            <p
              className={cn(
                typography.bodyMedium,
                colors.text.secondary,
                'leading-relaxed text-xs sm:text-sm'
              )}
            >
              {toast.description}
            </p>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className={cn(
          'absolute top-3 right-3 sm:top-5 sm:right-5',
          'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center',
          colors.text.quaternary,
          'hover:text-gray-600 dark:hover:text-gray-200',
          'rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800',
          animations.colors,
          animations.pressable,
          animations.focus,
          'touch-target'
        )}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>

      <ToastProgressBar type={toast.type} />
    </div>
  );
}
