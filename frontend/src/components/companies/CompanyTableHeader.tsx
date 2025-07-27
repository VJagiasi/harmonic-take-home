import { memo } from 'react';
import { SearchInput } from '@/components/common/SearchInput';
import { animations } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Collection } from '@/lib/types';

interface CompanyTableHeaderProps {
  selectedCollection: Collection;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  loading: boolean;
}

export const CompanyTableHeader = memo(function CompanyTableHeader({
  selectedCollection,
  searchTerm,
  onSearchChange,
  totalCount,
  loading,
}: CompanyTableHeaderProps) {
  return (
    <div
      className={cn(
        'px-8 py-7 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm space-y-6',
        animations.colors
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">
            {selectedCollection.collection_name}
          </h1>
          <div className="text-sm text-gray-500">
            {loading
              ? 'Loading...'
              : `${totalCount.toLocaleString()} companies`}
          </div>
        </div>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={`Search in ${selectedCollection.collection_name}...`}
        className="max-w-lg"
      />
    </div>
  );
});
