import { useState, useEffect, useRef, useCallback } from 'react';

export function useFetchData<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (isMounted.current) setData(result);
    } catch (err: any) {
      if (isMounted.current) setError(err?.message || 'Lỗi tải dữ liệu');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reset = useCallback(() => setData(null), []);

  return { data, loading, error, refetch: fetchData, reset };
}

export default useFetchData; 