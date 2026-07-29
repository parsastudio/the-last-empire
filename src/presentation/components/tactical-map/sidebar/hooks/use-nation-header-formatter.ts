import { useMemo } from "react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import {
  findCountryProfileById,
  findCountryProfileByCode,
} from "@/domain/map/countries";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface UseNationHeaderFormatterProps {
  code: string;
  flagCode: string;
  population: number;
  territorySize?: number;
}

export function useNationHeaderFormatter({
  code,
  flagCode,
  population,
  territorySize,
}: UseNationHeaderFormatterProps) {
  return useMemo(() => {
    const flagEmoji = getFlagEmoji(flagCode || code);

    let realTerritory = territorySize && territorySize > 0 ? territorySize : 0;
    if (!realTerritory) {
      const numericId = parseInt(code.replace("NATION_", ""), 10);
      const profile = !isNaN(numericId)
        ? findCountryProfileById(numericId)
        : findCountryProfileByCode(code);
      realTerritory = profile ? Math.round(profile.gdp / 1000000) : 377975;
    }

    const formattedArea = PersianNumberFormatter.toPersianDigits(
      Math.round(realTerritory).toLocaleString("en-US"),
    );

    let formattedPopulation = (population / 1e6).toFixed(1);
    if (population >= 1e9) {
      formattedPopulation = `${(population / 1e9).toFixed(2)} میلیارد`;
    } else {
      formattedPopulation = `${formattedPopulation} میلیون`;
    }

    formattedPopulation =
      PersianNumberFormatter.toPersianDigits(formattedPopulation);

    return {
      flagEmoji,
      formattedArea,
      formattedPopulation,
    };
  }, [code, flagCode, population, territorySize]);
}
