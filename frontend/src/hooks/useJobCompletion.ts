import { useEffect, useRef } from 'react';
import type { TransferJob } from '@/lib/types';
import type { ToastHook } from '@/types/ui';
import { debugLogger } from '@/lib/debug';

interface UseJobCompletionProps {
  transferJob: TransferJob | null;
  onJobComplete: () => void;
  toast: ToastHook;
}

export function useJobCompletion({
  transferJob,
  onJobComplete,
  toast,
}: UseJobCompletionProps): void {
  const prevJobStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!transferJob) {
      prevJobStatusRef.current = null;
      return;
    }

    const currentStatus = transferJob.status;
    const prevStatus = prevJobStatusRef.current;

    debugLogger.transfer('Status Change', {
      jobId: transferJob.job_id,
      prevStatus,
      currentStatus,
      progress: transferJob.progress,
      total: transferJob.total,
    });

    // Detect job completion (any transition to 'completed' status)
    // Made more robust to handle edge cases with status transitions
    if (currentStatus === 'completed' && prevStatus !== 'completed') {
      debugLogger.transfer('Completed', {
        companyCount: transferJob.total,
        jobId: transferJob.job_id,
      });

      // Show success toast for large transfer completion
      const companyCount = transferJob.total;
      const companyLabel = companyCount === 1 ? 'company' : 'companies';

      toast.success(
        'Status updated!',
        `${companyCount.toLocaleString()} ${companyLabel} processed successfully`
      );

      debugLogger.info('Completion toast shown');

      // Notify parent component to refresh data
      onJobComplete();
    } else if (currentStatus === 'completed') {
      debugLogger.warn('Job completion detected but toast already shown');
    }

    // Handle job failure (any transition to 'failed' status)
    if (currentStatus === 'failed' && prevStatus !== 'failed') {
      debugLogger.error('Background job failed', undefined, {
        jobId: transferJob.job_id,
        errorMessage: transferJob.error_message,
      });

      toast.error(
        'Update failed',
        transferJob.error_message || 'The transfer could not be completed'
      );
    }

    // Update previous status
    prevJobStatusRef.current = currentStatus;
  }, [transferJob, toast, onJobComplete]);
}
