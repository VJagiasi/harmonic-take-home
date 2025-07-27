import { memo } from 'react';
import {
  CompanySkeleton,
  CompanySkeletonMobile,
} from '@/components/common/CompanySkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { InfiniteScrollTrigger } from '@/components/common/InfiniteScrollTrigger';
import { DraggableCompanyTable } from './DraggableCompanyTable';
import { CompanyTableMobile } from './CompanyTableMobile';
import { cn } from '@/lib/utils';
import { animations, colors, spacing } from '@/lib/constants';
import type { Company, Collection } from '@/lib/types';

interface CompanyTableContentProps {
  companies: Company[];
  selectedCollection: Collection;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  searchTerm: string;
  selectedIds: number[];
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelection: (
    company: Company,
    index: number,
    event: React.MouseEvent
  ) => void;
  onLoadMore: () => void;
  onReorderCompanies?: (companies: Company[]) => void;
}

export const CompanyTableContent = memo(function CompanyTableContent({
  companies,
  selectedCollection,
  loading,
  loadingMore,
  hasMore,
  error,
  searchTerm,
  selectedIds,
  isAllSelected,
  onToggleSelectAll,
  onToggleSelection,
  onLoadMore,
  onReorderCompanies,
}: CompanyTableContentProps) {
  return (
    <div className="bg-gray-50/40">
      {error && (
        <div
          className={cn(
            'p-4 sm:p-6 border-l-4 border-red-500 bg-red-50 mx-3 sm:mx-6 lg:mx-8 my-4 sm:my-6 rounded-lg shadow-sm',
            colors.status.danger.soft,
            animations.pageEnter
          )}
        >
          <p className="text-red-900 font-semibold text-sm">
            Error loading companies
          </p>
          <p className="text-red-700 text-xs mt-1">{error}</p>
        </div>
      )}

      {loading && companies.length === 0 && (
        <div
          className={cn(
            'px-3 sm:px-6 lg:px-8 py-4 sm:py-6',
            animations.pageEnter
          )}
        >
          <CompanySkeleton count={8} />
          <CompanySkeletonMobile count={5} />
        </div>
      )}

      {!loading && companies.length === 0 && searchTerm && (
        <div
          className={cn(
            'h-full flex items-center justify-center px-3 sm:px-6 lg:px-8',
            animations.pageEnter
          )}
        >
          <EmptyState
            title="No companies found"
            description={`No companies match "${searchTerm}" in ${selectedCollection.collection_name}`}
          />
        </div>
      )}

      {companies.length > 0 && (
        <div className={cn(animations.pageEnter)}>
          <div className="hidden md:block px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div
              className={cn(
                'bg-white rounded-lg lg:rounded-xl border border-gray-200/60 shadow-sm',
                colors.surface.elevated,
                animations.hoverCard
              )}
            >
              <DraggableCompanyTable
                companies={companies}
                selectedIds={selectedIds}
                isAllSelected={isAllSelected}
                onToggleSelectAll={onToggleSelectAll}
                onToggleSelection={onToggleSelection}
                onReorderCompanies={onReorderCompanies || (() => {})}
                currentCollection={selectedCollection}
              />
            </div>
          </div>

          <div
            className={cn(
              'md:hidden px-3 py-4 sm:px-4 sm:py-6',
              spacing.stack.sm
            )}
          >
            <CompanyTableMobile
              companies={companies}
              selectedIds={selectedIds}
              onToggleSelection={(companyId: number) => {
                const mockEvent = { shiftKey: false } as React.MouseEvent;
                const company = companies.find(c => c.id === companyId);
                const index = companies.findIndex(c => c.id === companyId);
                if (company) {
                  onToggleSelection(company, index, mockEvent);
                }
              }}
              currentCollection={selectedCollection}
            />
          </div>

          {/* InfiniteScrollTrigger at the bottom of all content */}
          {hasMore && (
            <div className="px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              <InfiniteScrollTrigger
                onLoadMore={onLoadMore}
                loading={loadingMore}
                hasMore={hasMore}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});
