import { useState, useEffect, useCallback, useRef } from 'react';
import { getCollectionsById } from '@/utils/jam-api';
import type { Company, Collection, CompanyStatus } from '@/lib/types';

interface UseInfiniteCompaniesProps {
  collection: Collection | null;
  searchTerm: string;
  pageSize?: number;
}

interface UseInfiniteCompaniesReturn {
  companies: Company[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
  optimisticRemoveCompanies: (companyIds: number[]) => void;
  optimisticRestoreCompanies: (companies: Company[]) => void;
  optimisticUpdateCompanyStatus: (
    companyIds: number[],
    newStatus: CompanyStatus
  ) => void;
  updateCompaniesOrder: (reorderedCompanies: Company[]) => void;
}

export function useInfiniteCompanies({
  collection,
  searchTerm,
  pageSize = 50,
}: UseInfiniteCompaniesProps): UseInfiniteCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Keep track of current offset for pagination
  const offsetRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Cache for instant switching between collections
  const cacheRef = useRef<
    Map<
      string,
      {
        companies: Company[];
        totalCount: number;
        searchTerm: string;
      }
    >
  >(new Map());

  // Generate cache key - memoized to prevent unnecessary recalculations
  const getCacheKey = useCallback((collectionId: string, search: string) => {
    return `${collectionId}:${search}`;
  }, []);

  // Load companies with smooth error handling
  const loadCompanies = useCallback(
    async (
      collectionId: string,
      offset: number,
      limit: number,
      search: string
    ) => {
      try {
        setError(null);

        const response = await getCollectionsById(
          collectionId,
          offset,
          limit,
          search
        );

        return {
          companies: response.companies || [],
          total: response.total || 0,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load companies';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Initial load or search change
  const refresh = useCallback(async () => {
    if (!collection) return;

    const cacheKey = getCacheKey(collection.id, searchTerm);

    // Check cache for instant loading (only for empty search)
    if (!searchTerm && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setCompanies(cached.companies);
      setTotalCount(cached.totalCount);
      setHasMore(cached.companies.length < cached.totalCount);
      offsetRef.current = cached.companies.length;
      return;
    }

    setLoading(true);
    offsetRef.current = 0;

    try {
      const { companies: newCompanies, total } = await loadCompanies(
        collection.id,
        0,
        pageSize,
        searchTerm
      );

      setCompanies(newCompanies);
      setTotalCount(total);
      setHasMore(newCompanies.length < total && newCompanies.length > 0);
      offsetRef.current = newCompanies.length;

      // Cache results (only for non-search queries to keep cache simple)
      if (!searchTerm) {
        cacheRef.current.set(cacheKey, {
          companies: newCompanies,
          totalCount: total,
          searchTerm,
        });
      }
    } catch (err) {
      setCompanies([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [collection, searchTerm, pageSize, getCacheKey, loadCompanies]);

  // Load more for infinite scroll
  const loadMore = useCallback(async () => {
    if (!collection || !hasMore || loadingMore || loading) {
      return;
    }

    setLoadingMore(true);

    try {
      // Capture current offset to prevent race conditions
      const currentOffset = offsetRef.current;

      const { companies: newCompanies, total } = await loadCompanies(
        collection.id,
        currentOffset,
        pageSize,
        searchTerm
      );

      setCompanies(prev => {
        const updated = [...prev, ...newCompanies];
        return updated;
      });

      offsetRef.current = currentOffset + newCompanies.length;
      setTotalCount(total);

      const currentLoadedCount = offsetRef.current;
      const shouldHaveMore = currentLoadedCount < total;

      // Fixed hasMore logic - removed problematic newCompanies.length > 0 check
      setHasMore(shouldHaveMore);
    } catch (err) {
      // Don't immediately disable pagination on error - let user retry
      // Only disable if this is clearly a "no more data" scenario
      if (err instanceof Error && err.message.includes('404')) {
        setHasMore(false);
      } else {
        // Keep hasMore as true so user can try scrolling again
      }
    } finally {
      setLoadingMore(false);
    }
  }, [
    collection,
    hasMore,
    loadingMore,
    loading,
    pageSize,
    searchTerm,
    loadCompanies,
  ]);

  // Clear cache (used after transfers)
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Load companies when collection or search changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Optimistic updates for immediate UX
  const optimisticRemoveCompanies = useCallback((companyIds: number[]) => {
    setCompanies(prev => {
      const filtered = prev.filter(company => !companyIds.includes(company.id));
      offsetRef.current = filtered.length;
      return filtered;
    });
    setTotalCount(prev => {
      const newTotal = Math.max(0, prev - companyIds.length);
      setHasMore(offsetRef.current < newTotal);
      return newTotal;
    });
  }, []);

  const optimisticRestoreCompanies = useCallback(
    (companiesToRestore: Company[]) => {
      setCompanies(prev => {
        const restored = [...companiesToRestore, ...prev];
        offsetRef.current = restored.length;
        return restored;
      });
      setTotalCount(prev => {
        const newTotal = prev + companiesToRestore.length;
        setHasMore(offsetRef.current < newTotal);
        return newTotal;
      });
    },
    []
  );

  const optimisticUpdateCompanyStatus = useCallback(
    (companyIds: number[], newStatus: CompanyStatus) => {
      setCompanies(prev =>
        prev.map(company => {
          if (companyIds.includes(company.id)) {
            return {
              ...company,
              status: newStatus,
              liked: newStatus === 'liked',
            };
          }
          return company;
        })
      );
    },
    []
  );

  const updateCompaniesOrder = useCallback((reorderedCompanies: Company[]) => {
    setCompanies(reorderedCompanies);
  }, []);

  return {
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
  };
}
