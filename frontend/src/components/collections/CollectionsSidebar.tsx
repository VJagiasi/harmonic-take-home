import { cn } from '@/lib/utils';
import { animations, typography, collectionColors } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Collection } from '@/lib/types';

interface CollectionsSidebarProps {
  collections: Collection[];
  selectedCollection?: Collection | null;
  onCollectionSelect: (collection: Collection) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CollectionsSidebar({
  collections,
  selectedCollection,
  onCollectionSelect,
  isCollapsed = false,
  onToggleCollapse,
}: CollectionsSidebarProps) {
  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="absolute top-4 left-1 z-10 h-6 w-6 p-0 hover:bg-gray-100 rounded-md"
            title="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}

        <div className="flex-1 pt-16 p-2 space-y-2 overflow-y-auto">
          {collections.slice(0, 6).map((collection, index) => {
            const isActive = selectedCollection?.id === collection.id;
            const dotColor =
              collectionColors.dots[index % collectionColors.dots.length];

            return (
              <Tooltip
                key={collection.id}
                content={`${collection.collection_name} (${collection.total || 0} companies)`}
              >
                <button
                  onClick={() => onCollectionSelect(collection)}
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200',
                    'hover:bg-gray-100',
                    isActive ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
                  )}
                  title={`${collection.collection_name} (${collection.total || 0} companies)`}
                >
                  <div className={cn('w-3 h-3 rounded-full', dotColor)} />
                </button>
              </Tooltip>
            );
          })}

          {collections.length > 6 && (
            <Tooltip content={`${collections.length - 6} more collections`}>
              <div className="w-12 h-6 rounded-lg bg-gray-100 flex items-center justify-center cursor-help">
                <span className="text-xs text-gray-500">
                  +{collections.length - 6}
                </span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200/60 relative">
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="absolute top-4 right-4 h-6 w-6 p-0 hover:bg-gray-100 rounded-md"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        )}

        <h1
          className={cn(
            typography.h5,
            'mb-2 font-display text-lg sm:text-xl pr-12'
          )}
        >
          Collections
        </h1>
        <p className={cn(typography.bodyMedium, 'text-gray-500 text-sm')}>
          Organize and manage your company lists
        </p>
      </div>

      <div className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        {collections.map((collection, index) => {
          const isActive = selectedCollection?.id === collection.id;
          const colorVariant =
            collectionColors.variants[index % collectionColors.variants.length];
          const dotColor =
            collectionColors.dots[index % collectionColors.dots.length];

          return (
            <div
              key={collection.id}
              className={cn(
                'group relative cursor-pointer rounded-lg transition-all duration-200',
                'card-interactive hover-lift button-press',
                animations.focus,
                isActive
                  ? cn(colorVariant, 'shadow-sm ring-1 ring-blue-200/50')
                  : 'bg-white border border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-50/50'
              )}
              onClick={() => onCollectionSelect(collection)}
              role="button"
              tabIndex={0}
              aria-selected={isActive}
              aria-label={`Select ${collection.collection_name} collection`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCollectionSelect(collection);
                }
              }}
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div
                    className={cn(
                      'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm',
                      dotColor
                    )}
                  />
                  <h3
                    className={cn(
                      typography.label,
                      'truncate flex-1 font-medium text-sm sm:text-base',
                      isActive ? 'text-current' : 'text-gray-900'
                    )}
                  >
                    {collection.collection_name}
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      typography.bodySmall,
                      'tabular-nums font-medium text-xs sm:text-sm',
                      isActive ? 'text-current opacity-80' : 'text-gray-500'
                    )}
                  >
                    {collection.total?.toLocaleString() || 0} companies
                  </span>
                  {isActive && (
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current rounded-full animate-pulse opacity-60" />
                      <span
                        className={cn(
                          typography.bodySmall,
                          'font-medium text-current opacity-80 text-xs sm:text-sm'
                        )}
                      >
                        Active
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
