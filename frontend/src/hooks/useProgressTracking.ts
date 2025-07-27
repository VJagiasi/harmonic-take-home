import { useEffect, useRef } from 'react';
import { getJobStatus } from '@/utils/jam-api';
import { handleApiError } from '@/lib/error-handling';
import { TRANSFER_CONSTANTS } from '@/lib/constants';
import type { TransferJob } from '@/lib/types';
import { debugLogger } from '@/lib/debug';

export function useProgressTracking(
  jobId: string | null,
  onUpdate: (job: TransferJob) => void,
  onError?: (error: unknown) => void
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!jobId) {
      debugLogger.warn('No job ID for progress tracking');
      return;
    }

    debugLogger.transfer('Starting Progress Tracking', { jobId });

    const pollProgress = async () => {
      try {
        debugLogger.transfer('Polling Status', { jobId });
        const job = await getJobStatus(jobId);
        debugLogger.progress(job.job_id, job.progress, job.total);
        onUpdate(job);

        // Stop polling if job is complete
        if (job.status === 'completed' || job.status === 'failed') {
          debugLogger.transfer('Stopping Progress Polling', {
            status: job.status,
          });
          return;
        }

        // Continue polling
        debugLogger.debug(
          `Scheduling next poll in ${TRANSFER_CONSTANTS.PROGRESS_POLLING_INTERVAL_MS}ms`
        );
        timeoutRef.current = setTimeout(
          pollProgress,
          TRANSFER_CONSTANTS.PROGRESS_POLLING_INTERVAL_MS
        );
      } catch (unknownError) {
        const error = handleApiError(unknownError);
        debugLogger.error('Progress polling failed', error);
        onError?.(error);
      }
    };

    // Start polling
    pollProgress();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [jobId, onUpdate, onError]);
}
