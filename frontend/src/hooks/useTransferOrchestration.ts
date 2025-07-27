import { useCallback } from 'react';
import { TRANSFER_CONSTANTS } from '@/lib/constants';
import type { Company, Collection, CompanyStatus } from '@/lib/types';
import { getStatusFromCollectionName, getActionText } from '@/lib/types';
import type { ToastHook } from '@/types/ui';

interface UseTransferOrchestrationProps {
  selectedCollection: Collection | null;
  availableCollections: Collection[];
  companies: Company[];
  optimisticRemoveCompanies: (companyIds: number[]) => void;
  optimisticRestoreCompanies: (companies: Company[]) => void;
  optimisticUpdateCompanyStatus: (
    companyIds: number[],
    newStatus: CompanyStatus
  ) => void;
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
  clearCache: () => void;
  clearSelection: () => void;
  toast: ToastHook;
}

interface UseTransferOrchestrationReturn {
  handleTransfer: (
    destCollectionId: string,
    companyIds: number[],
    transferAll?: boolean
  ) => Promise<void>;
}

export function useTransferOrchestration({
  selectedCollection,
  availableCollections,
  companies,
  optimisticRemoveCompanies,
  optimisticRestoreCompanies,
  optimisticUpdateCompanyStatus,
  onTransfer,
  onUpdateCollectionCounts,
  clearCache,
  clearSelection,
  toast,
}: UseTransferOrchestrationProps): UseTransferOrchestrationReturn {
  const handleTransfer = useCallback(
    async (
      destCollectionId: string,
      companyIds: number[],
      transferAll?: boolean
    ): Promise<void> => {
      if (!selectedCollection) return;

      const destCollection = availableCollections.find(
        c => c.id === destCollectionId
      );
      const destName = destCollection?.collection_name || 'destination';
      const newStatus = getStatusFromCollectionName(destName);
      const actionText = getActionText(newStatus);

      const companiesToTransfer = transferAll
        ? companies.slice()
        : companies.filter(company => companyIds.includes(company.id));

      const isLargeTransfer =
        transferAll ||
        companyIds.length > TRANSFER_CONSTANTS.SMALL_BATCH_THRESHOLD;

      if (!isLargeTransfer) {
        optimisticRemoveCompanies(companyIds);
        clearSelection();
      } else {
        optimisticUpdateCompanyStatus(
          transferAll ? companies.map(c => c.id) : companyIds,
          newStatus
        );
        clearSelection();
      }

      const companyCount = companiesToTransfer.length;
      const companyLabel = companyCount === 1 ? 'company' : 'companies';

      toast.info(
        `Processing ${companyCount} ${companyLabel}`,
        `${actionText.action}...`
      );

      try {
        await onTransfer(destCollectionId, companyIds, transferAll);

        onUpdateCollectionCounts(
          selectedCollection.id,
          destCollectionId,
          companyCount,
          isLargeTransfer
        );

        if (!isLargeTransfer) {
          toast.success(
            'Status updated!',
            `${companyCount} ${companyLabel} ${actionText.verb}`
          );
        }

        if (!isLargeTransfer) {
          clearCache();
        }
      } catch (error) {
        if (!isLargeTransfer) {
          optimisticRestoreCompanies(companiesToTransfer);
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Please try again';
        toast.error('Transfer failed', errorMessage);
      }
    },
    [
      selectedCollection,
      availableCollections,
      companies,
      optimisticRemoveCompanies,
      optimisticRestoreCompanies,
      optimisticUpdateCompanyStatus,
      onTransfer,
      clearCache,
      toast,
      onUpdateCollectionCounts,
      clearSelection,
    ]
  );

  return {
    handleTransfer,
  };
}
