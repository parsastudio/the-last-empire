import { useMemo, useCallback } from "react";
import { Nation, GameStateMetricsUtility } from "@geopolitics/domain";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { useTacticalSearchFilter } from "@/presentation/hooks/common/use-tactical-search-filter";

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

    return Object.values(nationsMap)
      .filter((n) => {
        if (!n.isAlive) return false;
        return !GameStateMetricsUtility.isHumanNation(excludeNationId, n.id);
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

  const extractSearchFields = useCallback(
    (item: LiveNationItem) => [item.name, item.code, item.id, item.flagCode],
    [],
  );

  const filteredNations = useTacticalSearchFilter(
    allLiveNations,
    searchQuery,
    extractSearchFields,
  );

  return {
    filteredNations,
  };
}
