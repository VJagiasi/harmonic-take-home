import { useCallback, useRef } from 'react';
import type { Company, Collection, TransferJob } from '@/lib/types';
import type { ToastHook } from '@/types/ui';

interface UseTransferHandlerProps {
  selectedCollection: Collection | null;
  availableCollections: Collection[];
  companies: Company[];
  toast: ToastHook;
  onTransfer: (
    destCollectionId: string,
    companyIds: number[],
    transferAll?: boolean
  ) => Promise<void>;
  onUpdateCollectionCounts: (
    sourceCollectionId: string,
    destCollectionId: string,
    count: number,
    isLargeTransfer?: boolean
  ) => void;
  optimisticRemoveCompanies: (companyIds: number[]) => void;
  optimisticRestoreCompanies: (companies: Company[]) => void;
  clearCache: () => void;
  refresh: () => void;
  clearSelection: () => void;
  forceRefreshCollections?: () => void;
}

export function useTransferHandler({
  selectedCollection,
  availableCollections,
  companies,
  toast,
  onTransfer,
  onUpdateCollectionCounts,
  optimisticRemoveCompanies,
  optimisticRestoreCompanies,
  clearCache,
  refresh,
  clearSelection,
  forceRefreshCollections,
}: UseTransferHandlerProps) {
  const prevJobStatusRef = useRef<string | null>(null);

  const handleTransfer = useCallback(
    async (
      destCollectionId: string,
      companyIds: number[],
      transferAll?: boolean
    ) => {
      if (!selectedCollection) return;

      const destCollection = availableCollections.find(
        c => c.id === destCollectionId
      );
      const destName = destCollection?.collection_name || 'destination';

      const companiesToTransfer = transferAll
        ? companies.slice()
        : companies.filter(company => companyIds.includes(company.id));

      const isLargeTransfer = transferAll || companyIds.length > 10;

      if (!isLargeTransfer) {
        optimisticRemoveCompanies(companyIds);
        clearSelection();
      } else {
        clearSelection();
      }

      toast.info(
        `Transferring ${companiesToTransfer.length} ${companiesToTransfer.length === 1 ? 'company' : 'companies'}`,
        `Moving to ${destName}...`
      );

      try {
        await onTransfer(destCollectionId, companyIds, transferAll);

        onUpdateCollectionCounts(
          selectedCollection.id,
          destCollectionId,
          companiesToTransfer.length,
          isLargeTransfer
        );

        if (!isLargeTransfer) {
          toast.success(
            `Transfer completed!`,
            `${companiesToTransfer.length} ${companiesToTransfer.length === 1 ? 'company' : 'companies'} moved to ${destName}`
          );
          clearCache();
        }
      } catch (error) {
        if (!isLargeTransfer) {
          optimisticRestoreCompanies(companiesToTransfer);
        }

        toast.error(
          'Transfer failed',
          error instanceof Error ? error.message : 'Please try again'
        );
      }
    },
    [
      selectedCollection,
      availableCollections,
      companies,
      optimisticRemoveCompanies,
      optimisticRestoreCompanies,
      clearSelection,
      onTransfer,
      clearCache,
      toast,
      onUpdateCollectionCounts,
    ]
  );

  const handleJobCompletion = useCallback(
    (transferJob: TransferJob | null) => {
      if (!transferJob) {
        prevJobStatusRef.current = null;
        return;
      }

      const currentStatus = transferJob.status;
      const prevStatus = prevJobStatusRef.current;

      if (prevStatus === 'processing' && currentStatus === 'completed') {
        toast.success(
          'Transfer completed!',
          `${transferJob.total} companies successfully transferred`
        );

        if (forceRefreshCollections) {
          forceRefreshCollections();
        }

        setTimeout(() => {
          clearCache();
          refresh();
        }, 500);
      }

      prevJobStatusRef.current = currentStatus;
    },
    [toast, clearCache, refresh, forceRefreshCollections]
  );

  return {
    handleTransfer,
    handleJobCompletion,
  };
}
