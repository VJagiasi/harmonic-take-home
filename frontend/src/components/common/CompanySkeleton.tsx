import { cn } from '@/lib/utils';

interface CompanySkeletonProps {
  count?: number;
  className?: string;
}

export function CompanySkeleton({
  count = 5,
  className,
}: CompanySkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center space-x-4 p-4 border rounded-lg',
            'animate-pulse',
            'bg-muted/20 border-border/30'
          )}
          style={{
            animationDelay: `${index * 50}ms`,
            animationDuration: '1.5s',
          }}
        >
          {/* Checkbox skeleton */}
          <div className="w-4 h-4 bg-muted/40 rounded" />

          {/* Company name skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted/40 rounded w-3/4" />
            <div className="h-3 bg-muted/30 rounded w-1/2" />
          </div>

          {/* Status badge skeleton */}
          <div className="w-16 h-6 bg-muted/40 rounded-full" />

          {/* ID skeleton */}
          <div className="w-12 h-4 bg-muted/30 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CompanySkeletonMobile({ count = 3 }: { count?: number }) {
  return (
    <div className="md:hidden space-y-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'p-4 border rounded-lg space-y-3',
            'animate-pulse bg-muted/20 border-border/30'
          )}
          style={{
            animationDelay: `${index * 100}ms`,
            animationDuration: '1.5s',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="w-4 h-4 bg-muted/40 rounded" />
            <div className="w-16 h-6 bg-muted/40 rounded-full" />
          </div>

          {/* Company name */}
          <div className="space-y-2">
            <div className="h-5 bg-muted/40 rounded w-4/5" />
            <div className="h-3 bg-muted/30 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
