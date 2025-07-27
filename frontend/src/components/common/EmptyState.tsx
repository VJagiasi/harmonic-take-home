import { typography, spacing } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex-1 flex items-center justify-center p-6 sm:p-8',
        className
      )}
    >
      <div className={cn('text-center max-w-md mx-auto', spacing.stack.md)}>
        <h3
          className={cn(
            typography.h4,
            'text-gray-900 font-semibold text-lg sm:text-xl'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            typography.bodyMedium,
            'text-gray-500 text-sm sm:text-base leading-relaxed'
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
