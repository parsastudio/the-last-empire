import { useCallback } from "react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { findCountryProfileById } from "@/domain/map/countries";
import { HoverCountryInfo } from "../country-hover-container";
import { Nation } from "@/domain/nation/nation.schema";
import { useHoverStance } from "./use-hover-stance";

interface UseHoverNationResolverProps {
  countries: CountryMapping[];
  rankingsMap: Map<string, number>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useHoverNationResolver({
  countries,
  rankingsMap,
  nationsMap,
  humanNationId,
}: UseHoverNationResolverProps) {
  const { resolveStanceLabel } = useHoverStance();

  const resolveHoverInfo = useCallback(
    (
      nationIdNumber: number,
      greenChannelVal: number,
    ): HoverCountryInfo | null => {
      const matchedCountry = countries.find((c) => c.id === nationIdNumber);

      const fullNationId = `NATION_${nationIdNumber}`;
      let liveNation = nationsMap ? nationsMap[fullNationId] : null;

      if (!liveNation && nationsMap && matchedCountry) {
        liveNation =
          nationsMap[matchedCountry.code.toUpperCase()] ||
          nationsMap[matchedCountry.code.toLowerCase()] ||
          null;
      }

      const profile = findCountryProfileById(nationIdNumber);
      const realName = liveNation
        ? liveNation.name
        : profile
          ? profile.nameFa
          : matchedCountry
            ? matchedCountry.name
            : `کشور ${nationIdNumber}`;

      const realGdp = liveNation
        ? liveNation.gdp
        : profile
          ? profile.gdp
          : matchedCountry?.areaSqKm
            ? matchedCountry.areaSqKm * 1500
            : 50000000000;

      const gdpBillionsNum = realGdp / 1e9;
      const gdpFormatted = Number.isInteger(gdpBillionsNum)
        ? gdpBillionsNum.toString()
        : gdpBillionsNum.toFixed(1);

      const flagCode = profile
        ? profile.flagCode
        : matchedCountry
          ? matchedCountry.code
          : "IR";

      const countryCode = matchedCountry
        ? matchedCountry.code
        : profile
          ? profile.code
          : `${nationIdNumber}`;

      const stanceLabel = resolveStanceLabel(
        humanNationId,
        fullNationId,
        countryCode,
        nationsMap,
      );

      const possibleKeys = [
        fullNationId,
        fullNationId.toUpperCase(),
        fullNationId.toLowerCase(),
        countryCode.toUpperCase(),
        countryCode.toLowerCase(),
        flagCode.toUpperCase(),
        flagCode.toLowerCase(),
        nationIdNumber.toString(),
      ];

      let cachedRank = 99;
      for (const key of possibleKeys) {
        if (rankingsMap.has(key)) {
          cachedRank = rankingsMap.get(key)!;
          break;
        }
      }

      let regionLabel = "";
      if (greenChannelVal > 0) {
        regionLabel = `منطقه ${greenChannelVal.toLocaleString("fa-IR")}`;
      }

      const areaSqKm = matchedCountry?.areaSqKm ?? 50000;

      return {
        name: realName,
        code: countryCode,
        flagCode,
        rank: cachedRank,
        stance: stanceLabel,
        gdp: `$${gdpFormatted}B`,
        regionName: regionLabel,
        regionArea: `${Math.round(areaSqKm).toLocaleString("fa-IR")} km²`,
      };
    },
    [countries, rankingsMap, nationsMap, humanNationId, resolveStanceLabel],
  );

  return { resolveHoverInfo };
}
