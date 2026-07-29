import { useState, useMemo, useEffect } from "react";
import { NationDatabaseProvider } from "@/presentation/components/select-nation/utils/nation-database-provider";

export function useNationSelector(isOpen: boolean, onClose: () => void) {
  const [searchQuery, setSearchQuery] = useState("");
  const [presentIds, setPresentIds] = useState<Set<number> | null>(null);
  const provider = useMemo(() => new NationDatabaseProvider(), []);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    async function loadManifest() {
      try {
        const res = await fetch("/api/map-manifest?mode=partition");
        if (res.ok) {
          const json = await res.json();
          if (active && json.nations && Array.isArray(json.nations)) {
            const validSet = new Set<number>();
            for (const item of json.nations) {
              if (typeof item.numericId === "number") {
                validSet.add(item.numericId);
              }
            }
            if (validSet.size > 0) {
              setPresentIds(validSet);
              return;
            }
          }
        }
      } catch {}

      try {
        const resDef = await fetch("/api/map-manifest?mode=default");
        if (resDef.ok) {
          const jsonDef = await resDef.json();
          if (active && jsonDef.nations && Array.isArray(jsonDef.nations)) {
            const validSet = new Set<number>();
            for (const item of jsonDef.nations) {
              if (typeof item.numericId === "number") {
                validSet.add(item.numericId);
              }
            }
            if (validSet.size > 0) {
              setPresentIds(validSet);
            }
          }
        }
      } catch {}
    }

    loadManifest();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      active = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const allNations = useMemo(
    () => provider.getAllSelectableNations(presentIds || undefined),
    [provider, presentIds],
  );

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
