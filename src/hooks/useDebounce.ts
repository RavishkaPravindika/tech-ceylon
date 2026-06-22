'use client';

import { useState, useCallback } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // Use a stable callback pattern
  const update = useCallback((val: T) => {
    setDebouncedValue(val);
  }, []);

  // Effect-based debounce
  useState(() => {
    const handler = setTimeout(() => update(value), delay);
    return () => clearTimeout(handler);
  });

  return debouncedValue;
}

/**
 * Debounce a function call
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay = 300
): T {
  let timeout: ReturnType<typeof setTimeout>;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}
