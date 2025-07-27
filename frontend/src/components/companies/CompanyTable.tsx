import { useState, useMemo, memo, useCallback } from 'react';
import { CompanyTableHeader } from './CompanyTableHeader';
import { CompanyTableContent } from './CompanyTableContent';
import { SelectionToolbar } from './SelectionToolbar';
import { EmptyState } from '@/components/common/EmptyState';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import { useCompanySelection } from '@/hooks/useCompanySelection';
import { useInfiniteCompanies } from '@/hooks/useInfiniteCompanies';
import { useTransferOrchestration } from '@/hooks/useTransferOrchestration';
import { useRangeSelection } from '@/hooks/useRangeSelection';
import { useJobCompletion } from '@/hooks/useJobCompletion';
import type { Collection, TransferJob } from '@/lib/types';

interface CompanyTableProps {
  collections: Collection[];
  selectedCollection: Collection | null;
  onTransfer: (
    destCollectionId: string,
    companyIds: number[],
    transferAll?: boolean
  ) => Promise<void>;
  transferJob: TransferJob | null;
  onUpdateCollectionCounts: (
    sourceCollectionId: string,
    destCollectionId: string,
    count: number,
    isLargeTransfer?: boolean
  ) => void;
  forceRefreshCollections?: () => void;
}

const CompanyTable = memo(function CompanyTable({
  collections,
  selectedCollection,
  onTransfer,
  transferJob,
  onUpdateCollectionCounts,
  forceRefreshCollections,
}: CompanyTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const {
    companies,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    error,
    loadMore,
    refresh,
    clearCache,
    optimisticRemoveCompanies,
    optimisticRestoreCompanies,
    optimisticUpdateCompanyStatus,
    updateCompaniesOrder,
  } = useInfiniteCompanies({
    collection: selectedCollection,
    searchTerm,
    pageSize: 50,
  });

  const selectionState = useCompanySelection(companies);
  const availableCollections = useMemo(
    () => collections.filter(c => c.id !== selectedCollection?.id),
    [collections, selectedCollection?.id]
  );

  const { handleTransfer } = useTransferOrchestration({
    selectedCollection,
    availableCollections,
    companies,
    optimisticRemoveCompanies,
    optimisticRestoreCompanies,
    optimisticUpdateCompanyStatus,
    onTransfer,
    onUpdateCollectionCounts,
    clearCache,
    clearSelection: selectionState.clearSelection,
    toast,
  });

  const { handleRowClick } = useRangeSelection({
    companies,
    toggleSelection: selectionState.toggleSelection,
    selectedIds: selectionState.selectedIds,
  });

  useJobCompletion({
    transferJob,
    toast,
    onJobComplete: () => {
      if (forceRefreshCollections) {
        forceRefreshCollections();
      }

      setTimeout(() => {
        clearCache();
        refresh();
      }, 500);
    },
  });

  const handleReorderCompanies = useCallback(
    (reorderedCompanies: typeof companies) => {
      updateCompaniesOrder(reorderedCompanies);
    },
    [updateCompaniesOrder]
  );

  if (!selectedCollection) {
    return (
      <EmptyState
        title="Select a Collection"
        description="Choose a collection from the sidebar to view companies"
      />
    );
  }

  return (
    <div className="flex flex-col">
      <CompanyTableHeader
        selectedCollection={selectedCollection}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={totalCount}
        loading={loading}
      />

      <CompanyTableContent
        companies={companies}
        selectedCollection={selectedCollection}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        error={error}
        searchTerm={searchTerm}
        selectedIds={selectionState.selectedIds}
        isAllSelected={selectionState.isAllSelected}
        onToggleSelectAll={selectionState.toggleSelectAll}
        onToggleSelection={handleRowClick}
        onLoadMore={loadMore}
        onReorderCompanies={handleReorderCompanies}
      />

      <SelectionToolbar
        selectedCount={selectionState.selectedCount}
        totalCount={totalCount}
        availableCollections={availableCollections}
        onTransfer={handleTransfer}
        onClearSelection={selectionState.clearSelection}
        selectedIds={selectionState.selectedIds}
      />

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {selectionState.selectedCount > 0 &&
          `${selectionState.selectedCount} ${
            selectionState.selectedCount === 1 ? 'company' : 'companies'
          } selected`}
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
});

export { CompanyTable };
