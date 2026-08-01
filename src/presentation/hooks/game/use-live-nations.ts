import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import {
  findCountryProfileById,
  findCountryProfileByCode,
} from "@/domain/data/countries";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export interface LiveNationItem {
  id: string;
  name: string;
  code: string;
  flagCode: string;
  gdp: number;
  population: number;
  stability: number;
  corruption: number;
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
      ? NationIdResolver.resolveCanonicalId(excludeNationId)
      : null;

    return Object.values(nationsMap)
      .filter((n) => {
        if (!n.isAlive) return false;
        const canonical = NationIdResolver.resolveCanonicalId(n.id);
        return canonical !== canonicalExclude && n.id !== excludeNationId;
      })
      .map((n) => {
        const canonical = NationIdResolver.resolveCanonicalId(n.id);
        const numericId = parseInt(canonical.replace("NATION_", ""), 10);
        const profile = !isNaN(numericId)
          ? findCountryProfileById(numericId)
          : findCountryProfileByCode(n.flagCode || n.id);

        const flagCode = profile ? profile.flagCode : n.flagCode || "IR";
        const code = profile ? profile.code : canonical.replace("NATION_", "");

        return {
          id: n.id,
          name: n.name,
          code,
          flagCode,
          gdp: n.gdp,
          population: n.population,
          stability: n.government.stability,
          corruption: n.government.corruption,
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
    allLiveNations,
    filteredNations,
  };
}
