import { useMemo } from "react";

export function useTacticalSearchFilter<T>(
  items: readonly T[] | T[],
  searchQuery: string,
  fieldExtractor: (item: T) => (string | null | undefined)[],
): T[] {
  return useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items as T[];

    return (items as T[]).filter((item) => {
      const fields = fieldExtractor(item);
      return fields.some((f) => f && f.toLowerCase().includes(q));
    });
  }, [items, searchQuery, fieldExtractor]);
}
