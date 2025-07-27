import { useState, useCallback, useMemo } from 'react';
import type { Company } from '@/lib/types';

interface UseCompanySelectionReturn {
  selectedIds: number[];
  selectedCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  toggleSelection: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelectAll: () => void;
}

export function useCompanySelection(
  companies: Company[]
): UseCompanySelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const selectionMetrics = useMemo(
    () => ({
      selectedCount: selectedIds.size,
      isAllSelected:
        companies.length > 0 && selectedIds.size === companies.length,
      isPartiallySelected:
        selectedIds.size > 0 && selectedIds.size < companies.length,
    }),
    [selectedIds.size, companies.length]
  );

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(companies.map(c => c.id)));
  }, [companies]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectionMetrics.isAllSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [selectionMetrics.isAllSelected, selectAll, clearSelection]);

  const selectedIdsArray = useMemo(
    () => Array.from(selectedIds),
    [selectedIds]
  );

  return {
    selectedIds: selectedIdsArray,
    selectedCount: selectionMetrics.selectedCount,
    isAllSelected: selectionMetrics.isAllSelected,
    isPartiallySelected: selectionMetrics.isPartiallySelected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
  };
}
