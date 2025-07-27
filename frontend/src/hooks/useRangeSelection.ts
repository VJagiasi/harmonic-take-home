import { useState, useCallback } from 'react';
import type { Company } from '@/lib/types';

interface UseRangeSelectionProps {
  companies: Company[];
  toggleSelection: (id: number) => void;
  selectedIds: number[];
}

interface UseRangeSelectionReturn {
  handleRowClick: (
    company: Company,
    index: number,
    event: React.MouseEvent
  ) => void;
}

export function useRangeSelection({
  companies,
  toggleSelection,
  selectedIds,
}: UseRangeSelectionProps): UseRangeSelectionReturn {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  const handleRowClick = useCallback(
    (company: Company, index: number, event: React.MouseEvent): void => {
      // Handle shift+click for range selection
      if (event.shiftKey && lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);

        // Select all companies in the range that aren't already selected
        for (let i = start; i <= end; i++) {
          const currentCompany = companies[i];
          if (currentCompany && !selectedIds.includes(currentCompany.id)) {
            toggleSelection(currentCompany.id);
          }
        }
      } else {
        // Regular single selection
        toggleSelection(company.id);
      }

      setLastSelectedIndex(index);
    },
    [companies, toggleSelection, selectedIds, lastSelectedIndex]
  );

  return {
    handleRowClick,
  };
}
