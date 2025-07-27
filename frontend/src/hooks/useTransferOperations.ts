import { useState, useCallback } from 'react';
import { transferCompanies } from '@/utils/jam-api';
import { handleApiError, type AppError } from '@/lib/error-handling';
import { TRANSFER_CONSTANTS } from '@/lib/constants';
import type { TransferJob } from '@/lib/types';
import { debugLogger } from '@/lib/debug';

interface UseTransferOperationsReturn {
  isTransferring: boolean;
  transferJob: TransferJob | null;
  error: AppError | null;
  startTransfer: (
    sourceCollectionId: string,
    destCollectionId: string,
    companyIds: number[],
    transferAll?: boolean
  ) => Promise<string | null>;
  updateJobProgress: (job: TransferJob) => void;
  clearJob: () => void;
}

export function useTransferOperations(): UseTransferOperationsReturn {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferJob, setTransferJob] = useState<TransferJob | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const startTransfer = useCallback(
    async (
      sourceCollectionId: string,
      destCollectionId: string,
      companyIds: number[],
      transferAll: boolean = false
    ): Promise<string | null> => {
      try {
        debugLogger.transfer('Starting', {
          sourceCollectionId,
          destCollectionId,
          companyCount: companyIds.length,
          transferAll,
        });

        setIsTransferring(true);
        setError(null);

        const response = await transferCompanies(sourceCollectionId, {
          company_ids: companyIds,
          dest_collection_id: destCollectionId,
          transfer_all: transferAll,
        });

        debugLogger.transfer('API Response', {
          status: response.status,
          hasJobId: !!response.job_id,
        });

        if (response.job_id) {
          // Long-running job - track progress
          debugLogger.transfer('Background Job Created', {
            jobId: response.job_id,
          });
          setTransferJob({
            job_id: response.job_id,
            status: 'processing',
            progress: 0,
            total: transferAll
              ? TRANSFER_CONSTANTS.ESTIMATED_MAX_COMPANIES_FOR_TRANSFER_ALL
              : companyIds.length,
          });
          return response.job_id;
        } else {
          // Immediate completion
          debugLogger.transfer('Completed Immediately');
          setIsTransferring(false);
          return null;
        }
      } catch (unknownError) {
        const appError = handleApiError(unknownError);
        setError(appError);
        setIsTransferring(false);
        throw appError;
      }
    },
    []
  );

  const updateJobProgress = useCallback((job: TransferJob): void => {
    debugLogger.progress(job.job_id, job.progress, job.total);

    setTransferJob(job);

    if (job.status === 'completed' || job.status === 'failed') {
      debugLogger.transfer('Job Finished', {
        status: job.status,
        jobId: job.job_id,
      });
      setIsTransferring(false);
      // Clear job after a delay to show completion
      setTimeout(() => {
        setTransferJob(null);
        setError(null);
      }, TRANSFER_CONSTANTS.COMPLETION_DISPLAY_DURATION_MS);
    }
  }, []);

  const clearJob = useCallback((): void => {
    setTransferJob(null);
    setIsTransferring(false);
    setError(null);
  }, []);

  return {
    isTransferring,
    transferJob,
    error,
    startTransfer,
    updateJobProgress,
    clearJob,
  };
}
