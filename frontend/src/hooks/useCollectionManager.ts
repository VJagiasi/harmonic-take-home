import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCollectionsMetadata } from '@/utils/jam-api';
import useApi from '@/utils/useApi';
import { TRANSFER_CONSTANTS } from '@/lib/constants';
import type { Collection } from '@/lib/types';

interface UseCollectionManagerReturn {
  collections: Collection[];
  selectedCollection: Collection | null;
  loading: boolean;
  selectCollection: (collection: Collection) => void;
  updateCollectionCounts: (
    sourceCollectionId: string,
    destCollectionId: string,
    count: number,
    isLargeTransfer?: boolean
  ) => void;
  refreshCollections: () => void;
  forceRefreshCollections: () => void;
}

export function useCollectionManager(): UseCollectionManagerReturn {
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [localCollections, setLocalCollections] = useState<Collection[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pendingRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: apiCollections, loading } = useApi(getCollectionsMetadata);

  const refreshCollections = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const collections = await getCollectionsMetadata();
      setLocalCollections(collections);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to refresh collections';
      console.error('Failed to refresh collections:', message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const silentRefreshCollections = useCallback(async () => {
    try {
      const collections = await getCollectionsMetadata();
      setLocalCollections(collections);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Silent refresh failed';
      console.warn('Silent collection refresh failed:', message);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pendingRefreshTimeoutRef.current) {
        clearTimeout(pendingRefreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (apiCollections) {
      setLocalCollections(apiCollections);
    }
  }, [apiCollections]);

  useEffect(() => {
    if (
      localCollections &&
      localCollections.length > 0 &&
      !selectedCollection
    ) {
      setSelectedCollection(localCollections[0]);
    }
  }, [localCollections, selectedCollection]);

  useEffect(() => {
    if (selectedCollection) {
      window.history.pushState({}, '', `?collection=${selectedCollection.id}`);
    }
  }, [selectedCollection]);

  // Handle collection selection
  const selectCollection = useCallback((collection: Collection): void => {
    setSelectedCollection(collection);
  }, []);

  // Optimistically update collection counts after transfers
  const updateCollectionCounts = useCallback(
    (
      sourceCollectionId: string,
      destCollectionId: string,
      count: number,
      isLargeTransfer?: boolean
    ): void => {
      // Update the local collections array (for sidebar display)
      setLocalCollections(prevCollections =>
        prevCollections.map(collection => {
          if (collection.id === sourceCollectionId) {
            return {
              ...collection,
              total: Math.max(0, (collection.total || 0) - count),
            };
          } else if (collection.id === destCollectionId) {
            return {
              ...collection,
              total: (collection.total || 0) + count,
            };
          }
          return collection;
        })
      );

      // Update the selected collection if it's affected
      setSelectedCollection(prevSelected => {
        if (!prevSelected) return prevSelected;

        if (prevSelected.id === sourceCollectionId) {
          return {
            ...prevSelected,
            total: Math.max(0, (prevSelected.total || 0) - count),
          };
        } else if (prevSelected.id === destCollectionId) {
          return {
            ...prevSelected,
            total: (prevSelected.total || 0) + count,
          };
        }
        return prevSelected;
      });

      if (pendingRefreshTimeoutRef.current) {
        clearTimeout(pendingRefreshTimeoutRef.current);
        pendingRefreshTimeoutRef.current = null;
      }

      const refreshDelay = isLargeTransfer
        ? TRANSFER_CONSTANTS.COMPLETION_DISPLAY_DURATION_MS * 10 // 20 seconds for large transfers
        : TRANSFER_CONSTANTS.COMPLETION_DISPLAY_DURATION_MS; // 2 seconds for small transfers

      const timeout = setTimeout(() => {
        silentRefreshCollections()
          .then(() => {})
          .catch(() => {
            // Silent failure - no user notification needed
          });
        pendingRefreshTimeoutRef.current = null;
      }, refreshDelay);

      pendingRefreshTimeoutRef.current = timeout;
    },
    [silentRefreshCollections]
  );

  const forceRefreshCollections = useCallback(() => {
    if (pendingRefreshTimeoutRef.current) {
      clearTimeout(pendingRefreshTimeoutRef.current);
      pendingRefreshTimeoutRef.current = null;
    }

    silentRefreshCollections()
      .then(() => {})
      .catch(() => {
        // Silent failure - no user notification needed
      });
  }, [silentRefreshCollections]);

  return useMemo(
    () => ({
      collections: localCollections,
      selectedCollection,
      loading: loading || isRefreshing,
      selectCollection,
      updateCollectionCounts,
      refreshCollections,
      forceRefreshCollections,
    }),
    [
      localCollections,
      selectedCollection,
      loading,
      isRefreshing,
      selectCollection,
      updateCollectionCounts,
      refreshCollections,
      forceRefreshCollections,
    ]
  );
}
