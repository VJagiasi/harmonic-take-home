import { useState, useCallback } from 'react';
import type { Company } from '@/lib/types';

interface UseRowSelectionProps {
  companies: Company[];
  selectedIds: number[];
  toggleSelection: (companyId: number) => void;
}

export function useRowSelection({
  companies,
  selectedIds,
  toggleSelection,
}: UseRowSelectionProps) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  const handleRowClick = useCallback(
    (company: Company, index: number, event: React.MouseEvent) => {
      if (event.shiftKey && lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);

        for (let i = start; i <= end; i++) {
          if (companies[i] && !selectedIds.includes(companies[i].id)) {
            toggleSelection(companies[i].id);
          }
        }
      } else {
        toggleSelection(company.id);
      }

      setLastSelectedIndex(index);
    },
    [companies, selectedIds, toggleSelection, lastSelectedIndex]
  );

  return {
    handleRowClick,
  };
}
