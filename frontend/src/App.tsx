import { AppShell } from '@/components/layout/AppShell';
import { CompanyTable } from '@/components/companies/CompanyTable';
import { EnhancedProgressDialog } from '@/components/transfers/EnhancedProgressDialog';
import { useCollectionManager } from '@/hooks/useCollectionManager';
import { useTransferCoordinator } from '@/hooks/useTransferCoordinator';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  // Collection management
  const {
    collections,
    selectedCollection,
    loading: collectionsLoading,
    selectCollection,
    updateCollectionCounts,
    forceRefreshCollections,
  } = useCollectionManager();

  // Transfer coordination
  const { transferJob, handleTransfer, clearJob } = useTransferCoordinator({
    selectedCollection,
  });

  if (collectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading collections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell
        collections={collections}
        selectedCollection={selectedCollection}
        onCollectionSelect={selectCollection}
      >
        <CompanyTable
          collections={collections}
          selectedCollection={selectedCollection}
          onTransfer={handleTransfer}
          transferJob={transferJob}
          onUpdateCollectionCounts={updateCollectionCounts}
          forceRefreshCollections={forceRefreshCollections}
        />
      </AppShell>

      <EnhancedProgressDialog
        job={transferJob}
        onCancel={clearJob}
        onClose={clearJob}
      />
    </ErrorBoundary>
  );
}

export default App;
