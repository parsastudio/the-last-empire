import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

export interface LiveNationItem {
  id: string;
  name: string;
  code: string;
  flagCode: string;
  rawNation: Nation;
}

interface UseLiveNationsProps {
  nationsMap?: Record<string, Nation>;
  excludeNationId?: string;
  searchQuery?: string;
}

export function useLiveNations({
  nationsMap,
  excludeNationId,
  searchQuery = "",
}: UseLiveNationsProps) {
  const { countryTranslator } = useLocaleFormatter();

  const allLiveNations = useMemo<LiveNationItem[]>(() => {
    if (!nationsMap) return [];

    const canonicalExclude = excludeNationId
      ? CountryRegistry.resolveCanonicalId(excludeNationId)
      : null;

    return Object.values(nationsMap)
      .filter((n) => {
        if (!n.isAlive) return false;
        const canonical = CountryRegistry.resolveCanonicalId(n.id);
        return canonical !== canonicalExclude && n.id !== excludeNationId;
      })
      .map((n) => {
        const presented = NationPresenter.present(
          n,
          nationsMap,
          countryTranslator,
        );

        return {
          id: presented.canonicalId,
          name: presented.name,
          code: presented.canonicalId,
          flagCode: presented.flagCode,
          rawNation: n,
        };
      });
  }, [nationsMap, excludeNationId, countryTranslator]);

  const filteredNations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allLiveNations;

    return allLiveNations.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.flagCode.toLowerCase().includes(q),
    );
  }, [allLiveNations, searchQuery]);

  return {
    filteredNations,
  };
}
