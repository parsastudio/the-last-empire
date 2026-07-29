import { useState, useMemo } from "react";
import { NAVIGATION_TREE_NODES } from "../config/navigation-tree.config";
import { NavigationNode } from "../types/navigation-params.schema";

export function useCommandPaletteSearch() {
  const [query, setQuery] = useState("");

  const filteredNodes = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return NAVIGATION_TREE_NODES;
    }

    return NAVIGATION_TREE_NODES.filter((node) => {
      const inTitle = node.title.toLowerCase().includes(trimmed);
      const inDesc = node.description.toLowerCase().includes(trimmed);
      const inCategory = node.category.toLowerCase().includes(trimmed);
      const inKeywords = node.keywords.some((kw) =>
        kw.toLowerCase().includes(trimmed),
      );

      return inTitle || inDesc || inCategory || inKeywords;
    });
  }, [query]);

  return {
    query,
    setQuery,
    filteredNodes,
  };
}
