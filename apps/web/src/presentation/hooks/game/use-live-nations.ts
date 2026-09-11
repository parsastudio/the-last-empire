import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";
import { NationGettersUtility, AppLocale } from "@geopolitics/domain";

export interface LiveNationItem {
  id: string;
  name: string;
  code: string;
  flagCode: string;
  rank: number;
  gdp: number;
  population: number;
  stability: number;
  governmentType: string;
  isAlive: boolean;
  isReachable: boolean;
  rawNation: Nation;
}

interface UseLiveNationsProps {
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  excludeNationId?: string;
  searchQuery?: string;
}

export function useLiveNations({
  nationsMap,
  provincesMap,
  excludeNationId,
  searchQuery = "",
}: UseLiveNationsProps) {
  const currentLocale = useLocale() as AppLocale;
  const locale: AppLocale = currentLocale === "en" ? "en" : "fa";

  const allLiveNations = useMemo<LiveNationItem[]>(() => {
    if (!nationsMap) return [];

    const canonicalExclude = excludeNationId
      ? CountryRegistry.resolveCanonicalId(excludeNationId)
      : null;

    const sourceNation = canonicalExclude ? nationsMap[canonicalExclude] : null;
    const rankLookup = NationGettersUtility.calculateRankMap(
      nationsMap,
      provincesMap,
    );

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

        const name =
          locale === "en"
            ? profile?.nameEn || n.name
            : n.name || profile?.nameFa || canonical;

        const isReachable = sourceNation
          ? GeopoliticalReachResolver.canInitiateDiplomacy(
              sourceNation,
              n,
              nationsMap,
              provincesMap,
            )
          : true;

        const population = NationGettersUtility.getPopulation(
          n.id,
          provincesMap,
        );
        const rank = rankLookup.get(canonical) ?? 99;

        return {
          id: canonical,
          name,
          code,
          flagCode,
          rank,
          gdp: getNationGdp(n, provincesMap),
          population,
          stability: n.government.stability,
          governmentType: n.government.type,
          isAlive: n.isAlive,
          isReachable,
          rawNation: n,
        };
      });
  }, [nationsMap, provincesMap, excludeNationId, locale]);

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
