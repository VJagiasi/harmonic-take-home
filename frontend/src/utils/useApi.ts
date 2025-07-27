import { useEffect, useState, useRef, useCallback } from 'react';

const useApi = <T>(apiFunction: () => Promise<T>) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiRef = useRef(apiFunction);

  apiRef.current = apiFunction;

  useEffect(() => {
    let cancelled = false;

    const executeApi = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiRef.current();

        if (!cancelled) {
          setData(response);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'API call failed';
          setError(message);
          setLoading(false);
        }
      }
    };

    executeApi();

    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRef.current();
      setData(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'API call failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
};

export default useApi;
