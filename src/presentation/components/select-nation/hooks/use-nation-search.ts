import { useMemo } from "react";
import { NationDetail } from "../nation-list-item";

export function useNationSearch(nations: NationDetail[], searchQuery = "") {
  const filteredNations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return nations;

    return nations.filter(
      (n) =>
        n.name.toLowerCase().includes(query) ||
        n.id.toLowerCase().includes(query) ||
        n.code.toLowerCase().includes(query),
    );
  }, [nations, searchQuery]);

  return {
    filteredNations,
  };
}
