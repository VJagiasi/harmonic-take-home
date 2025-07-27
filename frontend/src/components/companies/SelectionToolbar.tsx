import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { animations, typography, colors } from '@/lib/constants';
import type { Collection } from '@/lib/types';

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  availableCollections: Collection[];
  selectedIds: number[];
  onTransfer: (
    destCollectionId: string,
    companyIds: number[],
    transferAll?: boolean
  ) => void;
  onClearSelection: () => void;
}

export function SelectionToolbar({
  selectedCount,
  totalCount,
  availableCollections,
  selectedIds,
  onTransfer,
  onClearSelection,
}: SelectionToolbarProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  if (selectedCount === 0) return null;

  const handleTransferSelected = () => {
    if (!selectedDestination) return;
    onTransfer(selectedDestination, selectedIds);
    setSelectedDestination('');
  };

  const handleTransferAll = () => {
    if (!selectedDestination) return;
    onTransfer(selectedDestination, [], true);
    setSelectedDestination('');
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50',
        'w-[calc(100vw-2rem)] sm:w-auto sm:max-w-4xl lg:max-w-5xl',
        animations.pageEnter
      )}
    >
      <div
        className={cn(
          'bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl sm:rounded-2xl shadow-2xl',
          'px-14 sm:px-16 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6',
          colors.surface.overlay,
          animations.lift
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div
            className={cn(
              'bg-blue-100 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base',
              typography.button,
              colors.status.info.soft,
              animations.pageEnter
            )}
          >
            {selectedCount}
          </div>
          <span
            className={cn(
              typography.bodyMedium,
              colors.text.secondary,
              'font-medium text-sm sm:text-base'
            )}
          >
            {selectedCount === 1 ? 'company' : 'companies'} selected
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <ArrowRight
            className={cn(
              'h-4 w-4 sm:h-5 sm:w-5 hidden sm:block',
              colors.text.quaternary
            )}
          />
          <Select
            value={selectedDestination}
            onValueChange={setSelectedDestination}
          >
            <SelectTrigger
              className={cn(
                'w-40 sm:w-48 border-gray-200/80 focus:border-blue-400 focus:ring-blue-100 text-sm',
                animations.focus,
                animations.colors
              )}
            >
              <SelectValue placeholder="Mark companies as..." />
            </SelectTrigger>
            <SelectContent
              className={cn(
                'border-gray-200/80 shadow-xl',
                colors.surface.overlay
              )}
            >
              {availableCollections.map(collection => (
                <SelectItem
                  key={collection.id}
                  value={collection.id}
                  className={cn(
                    'focus:bg-blue-50 focus:text-blue-900 text-sm',
                    animations.hoverSubtle
                  )}
                >
                  {collection.collection_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className={cn(
              'border-gray-200/80 hover:bg-gray-50 text-gray-700 text-sm whitespace-nowrap px-3',
              animations.hoverButton,
              animations.colors
            )}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>

          <Button
            size="sm"
            onClick={handleTransferSelected}
            disabled={!selectedDestination}
            className={cn(
              colors.brand.primary,
              animations.hoverButton,
              'shadow-sm disabled:opacity-50 text-sm whitespace-nowrap px-4'
            )}
          >
            Apply Status
          </Button>

          {selectedCount < totalCount && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTransferAll}
              disabled={!selectedDestination}
              className={cn(
                colors.brand.secondary,
                animations.hoverButton,
                'disabled:opacity-50 text-sm whitespace-nowrap px-3'
              )}
              title={`Apply status to all ${totalCount.toLocaleString()} companies`}
            >
              <span className="hidden sm:inline">
                Apply to All ({totalCount.toLocaleString()})
              </span>
              <span className="sm:hidden">
                All ({totalCount.toLocaleString()})
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
