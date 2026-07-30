import { useCallback } from "react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/infrastructure/data/countries";
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
          : matchedCountry?.areaSqKm
            ? matchedCountry.areaSqKm * 1500
            : 50000000000;

      const gdpBillionsNum = realGdp / 1e9;
      const gdpFormatted = Number.isInteger(gdpBillionsNum)
        ? gdpBillionsNum.toString()
        : gdpBillionsNum.toFixed(1);

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
