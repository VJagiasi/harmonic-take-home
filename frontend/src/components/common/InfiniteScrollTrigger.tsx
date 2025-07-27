import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { animations } from '@/lib/constants';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  threshold?: number;
  className?: string;
}

export function InfiniteScrollTrigger({
  onLoadMore,
  loading,
  hasMore,
  threshold = 0.1,
  className,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const lastTriggeredTimeRef = useRef<number>(0);

  const throttledLoadMore = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTrigger = now - lastTriggeredTimeRef.current;

    if (timeSinceLastTrigger < 800) {
      return;
    }

    lastTriggeredTimeRef.current = now;
    onLoadMore();
  }, [onLoadMore]);

  useEffect(() => {
    if (!hasMore || loading) {
      return;
    }

    const trigger = triggerRef.current;
    let observer: IntersectionObserver | null = null;

    if (trigger) {
      observer = new IntersectionObserver(
        entries => {
          const [entry] = entries;
          if (entry.isIntersecting && !loading && hasMore) {
            throttledLoadMore();
          }
        },
        {
          threshold,
          rootMargin: '300px 0px',
        }
      );
      observer.observe(trigger);
    }

    const handleScroll = () => {
      if (!hasMore || loading) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

      if (distanceFromBottom < 500) {
        throttledLoadMore();
      }
    };

    const handleResize = () => {
      setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    setTimeout(handleScroll, 100);

    return () => {
      if (observer && trigger) observer.unobserve(trigger);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [hasMore, loading, throttledLoadMore, threshold]);

  if (!hasMore) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">🎉 All companies loaded!</div>
      </div>
    );
  }

  return (
    <div
      ref={triggerRef}
      className={cn(
        'flex items-center justify-center py-6 min-h-[80px]',
        animations.colors,
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-sm">Loading more companies...</span>
        </div>
      ) : (
        <div className="text-xs text-gray-400">Scroll down to load more</div>
      )}
    </div>
  );
}
