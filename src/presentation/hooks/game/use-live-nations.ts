import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export interface LiveNationItem {
  id: string;
  name: string;
  code: string;
  flagCode: string;
  gdp: number;
  population: number;
  stability: number;
  governmentType: string;
  isAlive: boolean;
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
        const canonical = CountryRegistry.resolveCanonicalId(n.id);
        const profile =
          CountryRegistry.getCountry(canonical) ||
          CountryRegistry.getCountry(n.flagCode);

        const flagCode = profile ? profile.flagCode : n.flagCode || "IR";
        const code = profile ? profile.code : canonical;

        return {
          id: canonical,
          name: n.name,
          code,
          flagCode,
          gdp: getNationGdp(n),
          population: n.population,
          stability: n.government.stability,
          governmentType: n.government.type,
          isAlive: n.isAlive,
          rawNation: n,
        };
      });
  }, [nationsMap, excludeNationId]);

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
