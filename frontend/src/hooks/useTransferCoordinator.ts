import { useCallback } from 'react';
import { useTransferOperations } from './useTransferOperations';
import { useProgressTracking } from './useProgressTracking';
import type { Collection } from '@/lib/types';

interface UseTransferCoordinatorProps {
  selectedCollection: Collection | null;
}

interface UseTransferCoordinatorReturn {
  transferJob: ReturnType<typeof useTransferOperations>['transferJob'];
  isTransferring: boolean;
  handleTransfer: (
    destCollectionId: string,
    companyIds: number[],
    transferAll?: boolean
  ) => Promise<void>;
  clearJob: () => void;
}

export function useTransferCoordinator({
  selectedCollection,
}: UseTransferCoordinatorProps): UseTransferCoordinatorReturn {
  // Transfer operations
  const transferOps = useTransferOperations();

  // Progress tracking for background jobs
  useProgressTracking(
    transferOps.transferJob?.job_id || null,
    transferOps.updateJobProgress
  );

  // Handle company transfers
  const handleTransfer = useCallback(
    async (
      destCollectionId: string,
      companyIds: number[],
      transferAll: boolean = false
    ): Promise<void> => {
      if (!selectedCollection) return;

      // This now properly throws errors for the optimistic update handler to catch
      const jobId = await transferOps.startTransfer(
        selectedCollection.id,
        destCollectionId,
        companyIds,
        transferAll
      );

      if (!jobId) return;
    },
    [selectedCollection, transferOps]
  );

  return {
    transferJob: transferOps.transferJob,
    isTransferring: transferOps.isTransferring,
    handleTransfer,
    clearJob: transferOps.clearJob,
  };
}
