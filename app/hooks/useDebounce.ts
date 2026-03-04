// src/hooks/useDebounce.ts
// ─────────────────────────────────────────────────────────────
// Generic debounce hook. Returns debounced value after delay.
// Usage: const debouncedQuery = useDebounce(query, 350);
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;