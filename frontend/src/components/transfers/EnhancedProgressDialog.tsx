import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TransferDialogProps, ProgressMetrics } from '@/lib/types';

const iconVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  exit: { scale: 0, rotate: 180 },
};

export function EnhancedProgressDialog({
  job,
  onCancel,
  onClose,
}: TransferDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const progressMetrics: ProgressMetrics = useMemo(
    () => ({
      percentage: job?.total
        ? Math.min(100, Math.max(0, (job.progress / job.total) * 100))
        : 0,
      isProcessing: job?.status === 'processing' || job?.status === 'pending',
      isCompleted: job?.status === 'completed',
      isFailed: job?.status === 'failed',
      estimatedMinutesRemaining: job?.eta_seconds
        ? Math.ceil(job.eta_seconds / 60)
        : null,
    }),
    [job]
  );

  useEffect(() => {
    if (job) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [job]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // Early return with proper accessibility
  if (!job) return null;

  return (
    <Dialog open={isVisible} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'w-[90vw] max-w-sm sm:max-w-md lg:max-w-lg p-0 overflow-hidden',
          'bg-white dark:bg-gray-900',
          'border-0 shadow-2xl',
          'gap-0 focus:outline-none',
          // Responsive positioning for different screen sizes
          'mx-4 sm:mx-auto',
          // Ensure proper spacing on larger screens
          'lg:mx-auto lg:my-8'
        )}
        onPointerDownOutside={e => e.preventDefault()}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="h-1 bg-gray-100 dark:bg-gray-800"
          role="progressbar"
          aria-valuenow={Math.round(progressMetrics.percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Transfer progress: ${Math.round(progressMetrics.percentage)}%`}
        >
          <motion.div
            className={cn(
              'h-full transition-colors duration-300',
              progressMetrics.isCompleted
                ? 'bg-gray-900'
                : progressMetrics.isProcessing
                  ? 'bg-gray-900'
                  : 'bg-red-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressMetrics.percentage}%` }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
              // Respect reduced motion preference
              ...(prefersReducedMotion && {
                duration: 0.1,
              }),
            }}
          />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {progressMetrics.isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <header className="text-center space-y-2">
                  <motion.div
                    animate={{
                      rotate: prefersReducedMotion ? 0 : 360,
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 2,
                      repeat: prefersReducedMotion ? 0 : Infinity,
                      ease: 'linear',
                    }}
                    className="w-12 h-12 mx-auto mb-4"
                    aria-hidden="true"
                  >
                    <div className="w-full h-full rounded-full border-2 border-gray-200 border-t-gray-900" />
                  </motion.div>

                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Updating Status
                  </DialogTitle>

                  <DialogDescription className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span
                      className="font-medium"
                      aria-label={`${job.progress} companies processed`}
                    >
                      {job.progress.toLocaleString()}
                    </span>
                    <span>of</span>
                    <span
                      className="font-medium"
                      aria-label={`${job.total} total companies`}
                    >
                      {job.total.toLocaleString()}
                    </span>
                    <span>companies</span>
                  </DialogDescription>
                </header>

                <section
                  className="space-y-4"
                  aria-labelledby="progress-details"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span
                      className="font-medium text-gray-900 dark:text-white"
                      aria-live="polite"
                    >
                      {Math.round(progressMetrics.percentage)}%
                    </span>
                  </div>

                  <div
                    className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(progressMetrics.percentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Detailed progress: ${Math.round(progressMetrics.percentage)}% complete`}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressMetrics.percentage}%` }}
                      transition={{
                        duration: 0.5,
                        ease: 'easeOut',
                        ...(prefersReducedMotion && {
                          duration: 0.1,
                        }),
                      }}
                    >
                      {!prefersReducedMotion && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </motion.div>
                  </div>

                  {progressMetrics.estimatedMinutesRemaining && (
                    <div className="text-center">
                      <p
                        className="text-xs text-gray-500 dark:text-gray-400"
                        aria-live="polite"
                      >
                        Estimated time remaining:{' '}
                        {progressMetrics.estimatedMinutesRemaining} minutes
                      </p>
                    </div>
                  )}
                </section>

                {onCancel && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      aria-describedby="cancel-warning"
                    >
                      Cancel Update
                    </Button>
                    <p id="cancel-warning" className="sr-only">
                      Cancelling will stop the transfer and may leave it
                      incomplete
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {progressMetrics.isCompleted && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-6"
              >
                <div>
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      ...(prefersReducedMotion && {
                        type: 'tween',
                        duration: 0.2,
                      }),
                    }}
                    className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>

                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Status Updated
                  </DialogTitle>

                  <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Successfully updated {job.total.toLocaleString()} companies
                  </DialogDescription>
                </div>

                {onClose && (
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    autoFocus
                  >
                    Done
                  </Button>
                )}
              </motion.div>
            )}

            {progressMetrics.isFailed && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div>
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </motion.div>

                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Update Failed
                  </DialogTitle>

                  <DialogDescription
                    className="text-sm text-gray-600 dark:text-gray-400"
                    role="alert"
                    aria-live="assertive"
                  >
                    {job.error_message ||
                      'Something went wrong. Please try again.'}
                  </DialogDescription>
                </div>

                {onClose && (
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    autoFocus
                  >
                    Close
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
