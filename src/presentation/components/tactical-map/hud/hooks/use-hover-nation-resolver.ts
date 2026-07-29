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

  const resolveHoverInfo = (
    nationIdNumber: number,
    greenChannelVal: number,
  ): HoverCountryInfo | null => {
    const matchedCountry = countries.find((c) => c.id === nationIdNumber);
    if (!matchedCountry) return null;

    const fullNationId = `NATION_${matchedCountry.id}`;
    const liveNation = nationsMap ? nationsMap[fullNationId] : null;

    const profile = findCountryProfileById(matchedCountry.id);
    const realName = liveNation
      ? liveNation.name
      : profile
        ? profile.nameFa
        : matchedCountry.name;

    const realGdp = liveNation
      ? liveNation.gdp
      : profile
        ? profile.gdp
        : (matchedCountry.areaSqKm ?? 50000) * 1500;

    const gdpBillionsNum = realGdp / 1e9;
    const gdpFormatted = Number.isInteger(gdpBillionsNum)
      ? gdpBillionsNum.toString()
      : gdpBillionsNum.toFixed(1);

    const flagCode = profile ? profile.flagCode : matchedCountry.code;

    const stanceLabel = resolveStanceLabel(
      humanNationId,
      fullNationId,
      matchedCountry.code,
      nationsMap,
    );

    const possibleKeys = [
      fullNationId,
      matchedCountry.code.toUpperCase(),
      matchedCountry.code.toLowerCase(),
      matchedCountry.id.toString(),
    ];

    let cachedRank = rankingsMap.size > 0 ? rankingsMap.size : 99;
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

    return {
      name: realName,
      code: matchedCountry.code,
      flagCode,
      rank: cachedRank,
      stance: stanceLabel,
      gdp: `$${gdpFormatted}B`,
      regionName: regionLabel,
      regionArea: `${Math.round(matchedCountry.areaSqKm ?? 50000).toLocaleString("fa-IR")} km²`,
    };
  };

  return { resolveHoverInfo };
}
