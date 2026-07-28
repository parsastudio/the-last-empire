import { useMemo } from "react";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";
import {
  ALL_COUNTRY_PROFILES,
  findCountryProfileById,
  findCountryProfileByCode,
} from "@/domain/map/countries";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { GovernmentSystem } from "@/engine/politics/government-system";

export function useCountryHoverRankings(
  countries: CountryMapping[],
): Map<string, number> {
  const governmentSystem = useMemo(() => new GovernmentSystem(), []);

  return useMemo(() => {
    const cache = new Map<string, number>();
    const processedIds = new Set<number>();

    const rawList = ALL_COUNTRY_PROFILES.map((p) => {
      processedIds.add(p.id);
      const matchedCountry = countries.find(
        (c) => c.id === p.id || c.code.toUpperCase() === p.code.toUpperCase(),
      );
      const gdp =
        p.gdp ||
        (matchedCountry?.areaSqKm
          ? matchedCountry.areaSqKm * 1500
          : 5000000000);

      const govType = p.startingGovernment ?? "DEMOCRACY";
      const govTraits = governmentSystem.getTraits(govType);

      return {
        id: `NATION_${p.id}`,
        numericId: p.id,
        code: p.code,
        gdp,
        treasury: p.startingTreasury,
        infantry: p.startingInfantry ?? 50,
        airForce: p.startingAirForce ?? 10,
        drone: p.startingDroneMissile ?? 0,
        techLevel: p.startingTechLevel ?? 1,
        militaryPowerMultiplier: govTraits.militaryPowerMultiplier,
      };
    });

    for (const c of countries) {
      if (c.id <= 0 || c.id >= 250 || processedIds.has(c.id)) {
        continue;
      }
      const profile =
        findCountryProfileById(c.id) || findCountryProfileByCode(c.code);
      if (!profile) {
        const fallbackGdp = c.areaSqKm ? c.areaSqKm * 1500 : 1000000000;
        rawList.push({
          id: `NATION_${c.id}`,
          numericId: c.id,
          code: c.code,
          gdp: fallbackGdp,
          treasury: 50000,
          infantry: 20,
          airForce: 5,
          drone: 0,
          techLevel: 1,
          militaryPowerMultiplier: 1.0,
        });
        processedIds.add(c.id);
      }
    }

    const ranker = new PowerScoreRanker();
    const ranked = ranker.rankNations(rawList);

    for (const r of ranked) {
      const rank = r.rank;
      const rawItem = rawList.find((item) => item.id === r.id);

      cache.set(r.id, rank);
      cache.set(r.id.toUpperCase(), rank);

      if (rawItem) {
        cache.set(rawItem.code.toUpperCase(), rank);
        cache.set(rawItem.code.toLowerCase(), rank);
        cache.set(rawItem.numericId.toString(), rank);
        cache.set(`NATION_${rawItem.numericId}`, rank);
      }
    }

    return cache;
  }, [countries, governmentSystem]);
}
