import { useCallback } from "react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { findCountryProfileById } from "@/domain/map/countries";
import { HoverCountryInfo } from "../country-hover-container";
import { Nation } from "@/domain/nation/nation.schema";
import { useHoverStance } from "./use-hover-stance";

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
  const { resolveStanceLabel } = useHoverStance();

  const resolveHoverInfo = useCallback(
    (nationIdNumber: number, enclaveIdVal: number): HoverCountryInfo | null => {
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

      const realRank = liveNation ? liveNation.rank : 99;

      let regionLabel = "خاک اصلی";
      if (enclaveIdVal >= 1 && enclaveIdVal <= 10) {
        regionLabel = `منطقه فرامرزی ${enclaveIdVal.toLocaleString("fa-IR")}`;
      } else if (enclaveIdVal >= 11) {
        regionLabel = `قلمرو برون‌مرزی ${(enclaveIdVal - 10).toLocaleString("fa-IR")}`;
      }

      const areaSqKm = matchedCountry?.areaSqKm ?? 50000;

      return {
        name: realName,
        code: countryCode,
        flagCode,
        rank: realRank,
        stance: stanceLabel,
        gdp: `$${gdpFormatted}B`,
        regionName: regionLabel,
        regionArea: `${Math.round(areaSqKm).toLocaleString("fa-IR")} km²`,
      };
    },
    [countries, nationsMap, humanNationId, resolveStanceLabel],
  );

  return { resolveHoverInfo };
}
