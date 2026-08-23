import { useCallback } from "react";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import {
  getNationGdp,
  getProvinceGdp,
} from "@/domain/nation/gdp-calculator.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { CountryRegistry } from "@/domain/data/countries";

interface UseHoverNationResolverProps {
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
}

export function useHoverNationResolver({
  provincesMap,
  nationsMap,
}: UseHoverNationResolverProps) {
  const resolveHoverInfo = useCallback(
    (provinceId: number): HoverCountryInfo | null => {
      if (
        provinceId < BitPackedCellUtility.FIRST_PROVINCE_ID ||
        !provincesMap
      ) {
        return null;
      }

      const province = provincesMap[provinceId.toString()];
      if (!province) return null;

      const canonicalOwnerId = CountryRegistry.resolveCanonicalId(
        province.ownerNationId,
      );
      const ownerNation = nationsMap
        ? nationsMap[canonicalOwnerId] || nationsMap[province.ownerNationId]
        : null;

      const realName = ownerNation ? ownerNation.name : "کشور ناشناخته";
      const flagCode = ownerNation ? ownerNation.flagCode : "IR";
      const realRank = ownerNation ? ownerNation.rank : 99;
      const realGdp = ownerNation ? getNationGdp(ownerNation, provincesMap) : 0;
      const realPop = ownerNation ? ownerNation.population : 0;
      const governmentType = ownerNation
        ? ownerNation.government.type
        : "DEMOCRACY";

      const totalPopulationText =
        NationPresentationMapper.formatPopulation(realPop);

      const summary = NationPresentationMapper.formatNationSummary(
        canonicalOwnerId,
        realName,
        canonicalOwnerId,
        flagCode,
        realRank,
        realGdp,
        realPop,
        governmentType,
      );

      const provinceGdp = getProvinceGdp(province);
      const provinceGdpText = PersianNumberFormatter.formatCurrency(
        provinceGdp,
        true,
      );
      const provincePopText = NationPresentationMapper.formatPopulation(
        province.population,
      );
      const provinceCapPct = Math.round(
        (province.population / Math.max(1, province.maxPopulationCapacity)) *
          100,
      );

      return {
        name: summary.name,
        code: summary.code,
        flagCode: summary.flagCode,
        rank: summary.rank,
        stance: "دیپلماسی استان",
        regionName: province.nameFa,
        regionPopulation: provincePopText,
        regionGdpText: provinceGdpText,
        regionCapacityPercentage: provinceCapPct,
        totalPopulation: totalPopulationText,
        gdpText: summary.gdpText,
      };
    },
    [provincesMap, nationsMap],
  );

  return { resolveHoverInfo };
}
