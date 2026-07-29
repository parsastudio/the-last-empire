import { useState, useMemo, useEffect } from "react";
import { NationDatabaseProvider } from "@/presentation/components/select-nation/utils/nation-database-provider";

export function useNationSelector(isOpen: boolean, onClose: () => void) {
  const [searchQuery, setSearchQuery] = useState("");
  const provider = useMemo(() => new NationDatabaseProvider(), []);
  const allNations = useMemo(
    () => provider.getAllSelectableNations(),
    [provider],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredNations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allNations;

    return allNations.filter(
      (n) =>
        n.name.toLowerCase().includes(query) ||
        n.id.toLowerCase().includes(query) ||
        n.code.toLowerCase().includes(query),
    );
  }, [allNations, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredNations,
  };
}
