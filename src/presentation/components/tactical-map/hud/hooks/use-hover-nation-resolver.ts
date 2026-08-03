import { useCallback } from "react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/data/countries";
import { HoverCountryInfo } from "../country-hover-container";
import { Nation } from "@/domain/nation/nation.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function resolveStanceLabel(
  humanNationId: string | undefined,
  fullNationId: string,
  countryCode: string,
  nationsMap?: Record<string, Nation>,
): string {
  if (!humanNationId || !nationsMap || !nationsMap[humanNationId]) {
    return "دیپلماسی عادی";
  }

  const humanNation = nationsMap[humanNationId];
  const relation =
    humanNation.relations[fullNationId] ||
    humanNation.relations[countryCode.toUpperCase()];

  if (relation) {
    if (relation.stance === "WAR") return "وضعیت نبرد";
    if (relation.stance === "SEVERED_RELATIONS" || relation.isTradeEmbargoed)
      return "قطع روابط تجاری";
    if (relation.stance === "ALLIANCE") return "متحد استراتژیک";
    if (relation.stance === "NON_AGGRESSION_PACT") return "پیمان عدم تخاصم";
  }

  return "دیپلماسی عادی";
}

interface UseHoverNationResolverProps {
  countries: CountryMapping[];
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useHoverNationResolver({
  countries,
  nationsMap,
  humanNationId,
}: UseHoverNationResolverProps) {
  const resolveHoverInfo = useCallback(
    (nationIdNumber: number, enclaveIdVal: number): HoverCountryInfo | null => {
      const matchedCountry = countries.find((c) => c.id === nationIdNumber);

      const profile =
        findCountryProfileById(nationIdNumber) ||
        (matchedCountry
          ? findCountryProfileByCode(matchedCountry.code)
          : undefined);

      if (!matchedCountry && !profile) return null;

      const countryCode = profile
        ? profile.code.toUpperCase()
        : matchedCountry!.code.toUpperCase();
      const fullNationId = `NATION_${countryCode}`;

      let liveNation = nationsMap ? nationsMap[fullNationId] : null;

      if (!liveNation && nationsMap) {
        liveNation =
          nationsMap[countryCode] ||
          nationsMap[`NATION_${nationIdNumber}`] ||
          null;
      }

      const realName = liveNation
        ? liveNation.name
        : profile
          ? profile.nameFa
          : matchedCountry!.name;

      const realGdp = liveNation
        ? liveNation.gdp
        : profile
          ? profile.gdp
          : 50000000000;

      const gdpFormatted = PersianNumberFormatter.formatCurrency(realGdp, true);

      const flagCode = profile
        ? profile.flagCode
        : matchedCountry?.code || countryCode;

      const stanceLabel = resolveStanceLabel(
        humanNationId,
        fullNationId,
        countryCode,
        nationsMap,
      );

      const realRank = liveNation ? liveNation.rank : 99;

      let regionLabel = "خاک اصلی";
      let displayAreaKm2 = liveNation
        ? liveNation.geography.territorySize
        : profile
          ? Math.round(profile.gdp / 1000000)
          : 50000;

      if (liveNation && liveNation.regionsDemographics) {
        const matchedRegion = liveNation.regionsDemographics.find(
          (r) => r.regionId === enclaveIdVal,
        );
        if (matchedRegion) {
          regionLabel = matchedRegion.name;
          displayAreaKm2 = matchedRegion.areaSqKm;
        } else if (enclaveIdVal > 0) {
          regionLabel = `منطقه فرامرزی ${enclaveIdVal.toLocaleString("fa-IR")}`;
        }
      } else if (enclaveIdVal > 0) {
        regionLabel = `منطقه فرامرزی ${enclaveIdVal.toLocaleString("fa-IR")}`;
      }

      const formattedAreaText = `${PersianNumberFormatter.toPersianDigits(
        Math.round(displayAreaKm2).toLocaleString("en-US"),
      )} km²`;

      return {
        name: realName,
        code: countryCode,
        flagCode,
        rank: realRank,
        stance: stanceLabel,
        gdp: gdpFormatted,
        regionName: regionLabel,
        regionArea: formattedAreaText,
      };
    },
    [countries, nationsMap, humanNationId],
  );

  return { resolveHoverInfo };
}
