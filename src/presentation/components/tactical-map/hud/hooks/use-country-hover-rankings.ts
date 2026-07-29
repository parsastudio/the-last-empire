import { useMemo } from "react";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";
import {
  ALL_COUNTRY_PROFILES,
  findCountryProfileById,
  findCountryProfileByCode,
} from "@/domain/map/countries";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { Nation } from "@/domain/nation/nation.schema";

export function useCountryHoverRankings(
  countries: CountryMapping[],
  nationsMap?: Record<string, Nation>,
): Map<string, number> {
  const governmentSystem = useMemo(() => new GovernmentSystem(), []);

  return useMemo(() => {
    const cache = new Map<string, number>();
    const processedIds = new Set<number>();

    let rawList: {
      id: string;
      numericId: number;
      code: string;
      gdp: number;
      treasury: number;
      infantry: number;
      airForce: number;
      drone: number;
      techLevel: number;
      militaryPowerMultiplier: number;
    }[] = [];

    if (nationsMap && Object.keys(nationsMap).length > 0) {
      rawList = Object.values(nationsMap)
        .filter((n) => n.isAlive)
        .map((n) => {
          const numericId = parseInt(n.id.replace("NATION_", ""), 10);
          if (!isNaN(numericId)) {
            processedIds.add(numericId);
          }
          const govTraits = governmentSystem.getTraits(n.government.type);

          return {
            id: n.id,
            numericId: !isNaN(numericId) ? numericId : 0,
            code: n.flagCode || n.id,
            gdp: n.gdp,
            treasury: n.treasury,
            infantry: n.military.infantry,
            airForce: n.military.airForce,
            drone: n.military.droneMissile,
            techLevel: n.military.techLevel,
            militaryPowerMultiplier: govTraits.militaryPowerMultiplier,
          };
        });
    } else {
      rawList = ALL_COUNTRY_PROFILES.map((p) => {
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
    }

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

      const numericId = parseInt(r.id.replace("NATION_", ""), 10);

      cache.set(r.id, rank);
      cache.set(r.id.toUpperCase(), rank);
      cache.set(r.id.toLowerCase(), rank);

      if (!isNaN(numericId)) {
        cache.set(numericId.toString(), rank);
        cache.set(`NATION_${numericId}`, rank);
        cache.set(`nation_${numericId}`, rank);

        const profile = findCountryProfileById(numericId);
        if (profile) {
          cache.set(profile.code.toUpperCase(), rank);
          cache.set(profile.code.toLowerCase(), rank);
          cache.set(profile.flagCode.toUpperCase(), rank);
          cache.set(profile.flagCode.toLowerCase(), rank);
        }
      }

      if (rawItem) {
        cache.set(rawItem.code.toUpperCase(), rank);
        cache.set(rawItem.code.toLowerCase(), rank);
      }
    }

    return cache;
  }, [countries, governmentSystem, nationsMap]);
}
