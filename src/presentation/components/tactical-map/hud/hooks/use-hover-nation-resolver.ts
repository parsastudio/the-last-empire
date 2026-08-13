import { useCallback, useMemo } from "react";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";

interface UseHoverNationResolverProps {
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
}

export function useHoverNationResolver({
  provincesMap,
  nationsMap,
}: UseHoverNationResolverProps) {
  const syncedProvincesMap = useMemo(() => {
    if (!provincesMap) return {};
    const buffer = BitPackedGridState.getInstance().getBuffer();
    return ProvincePixelCalculator.syncProvincesMapPixelCounts(
      buffer,
      provincesMap,
    );
  }, [provincesMap]);

  const totalWorldLandPixels = useMemo(() => {
    let sum = 0;
    const values = Object.values(syncedProvincesMap);
    for (let i = 0; i < values.length; i++) {
      sum += values[i]?.pixelCount || 0;
    }
    return sum > 0 ? sum : 1;
  }, [syncedProvincesMap]);

  const resolveHoverInfo = useCallback(
    (provinceId: number): HoverCountryInfo | null => {
      if (provinceId < BitPackedCellUtility.FIRST_PROVINCE_ID) {
        return null;
      }

      const province = syncedProvincesMap[provinceId.toString()];
      if (!province) return null;

      const canonicalOwnerId = CountryRegistry.resolveCanonicalId(
        province.ownerNationId,
      );
      const ownerNation = nationsMap
        ? nationsMap[province.ownerNationId] || nationsMap[canonicalOwnerId]
        : null;

      const realName = ownerNation ? ownerNation.name : "کشور ناشناخته";
      const flagCode = ownerNation ? ownerNation.flagCode : "IR";
      const realRank = ownerNation ? ownerNation.rank : 99;
      const realGdp = ownerNation ? getNationGdp(ownerNation) : 0;
      const realPop = ownerNation ? ownerNation.population : 0;
      const governmentType = ownerNation
        ? ownerNation.government.type
        : "DEMOCRACY";

      const totalNationPixels = ownerNation
        ? ownerNation.geography.territoryPixelCount || province.pixelCount || 1
        : province.pixelCount || 1;

      const worldLandSharePct =
        (totalNationPixels / totalWorldLandPixels) * 100;

      const formattedWorldAreaPct =
        worldLandSharePct < 0.1 && worldLandSharePct > 0
          ? "< ۰.۱"
          : PersianNumberFormatter.toPersianDigits(
              Number(worldLandSharePct.toFixed(1)).toString(),
            );

      const totalPopulationText =
        NationPresentationMapper.formatPopulation(realPop);
      const worldAreaPercentageText = `${formattedWorldAreaPct}٪ از کل جهان`;

      const summary = NationPresentationMapper.formatNationSummary(
        province.ownerNationId,
        realName,
        province.ownerNationId,
        flagCode,
        realRank,
        realGdp,
        realPop,
        governmentType,
      );

      return {
        name: summary.name,
        code: summary.code,
        flagCode: summary.flagCode,
        rank: summary.rank,
        stance: "دیپلماسی استان",
        regionName: province.nameFa,
        totalPopulation: totalPopulationText,
        worldAreaPercentage: worldAreaPercentageText,
      };
    },
    [syncedProvincesMap, nationsMap, totalWorldLandPixels],
  );

  return { resolveHoverInfo };
}
