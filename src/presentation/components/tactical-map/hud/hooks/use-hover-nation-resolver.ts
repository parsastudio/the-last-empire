import { useCallback, useMemo } from "react";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

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

  const resolveHoverInfo = useCallback(
    (provinceId: number): HoverCountryInfo | null => {
      if (provinceId <= 0) return null;

      if (provinceId < BitPackedCellUtility.FIRST_PROVINCE_ID) {
        return {
          name: "منطقه رزرو شده سیستمی",
          code: `SYS_${provinceId}`,
          flagCode: "UN",
          rank: 0,
          stance: "غیرقابل سکونت / غیرفعال",
          regionName: `منطقه ویژه سیستمی #${provinceId}`,
          regionPopulation: "۰ نفر",
          regionAreaPercentage: "۰٪ از مساحت",
        };
      }

      const province = syncedProvincesMap[provinceId.toString()];
      if (!province) return null;

      const ownerNation = nationsMap
        ? nationsMap[province.ownerNationId]
        : null;

      const realName = ownerNation ? ownerNation.name : "کشور ناشناخته";
      const flagCode = ownerNation ? ownerNation.flagCode : "IR";
      const realRank = ownerNation ? ownerNation.rank : 99;
      const realGdp = 0;
      const realPop = ownerNation ? ownerNation.population : 0;
      const governmentType = ownerNation
        ? ownerNation.government.type
        : "DEMOCRACY";

      const totalNationPixels = ownerNation
        ? ownerNation.geography.territoryPixelCount || province.pixelCount || 1
        : province.pixelCount || 1;

      const provPixels = province.pixelCount || 0;
      const areaPctNum =
        totalNationPixels > 0 ? (provPixels / totalNationPixels) * 100 : 0;

      const regionPopNum = Math.round(realPop * (areaPctNum / 100));

      const regionPopulationText =
        NationPresentationMapper.formatPopulation(regionPopNum);

      const formattedAreaPct =
        areaPctNum < 0.1 && areaPctNum > 0
          ? "< ۰.۱"
          : PersianNumberFormatter.toPersianDigits(
              Number(areaPctNum.toFixed(1)).toString(),
            );

      const regionAreaPercentageText = `${formattedAreaPct}٪ از مساحت`;

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
        regionPopulation: regionPopulationText,
        regionAreaPercentage: regionAreaPercentageText,
      };
    },
    [syncedProvincesMap, nationsMap],
  );

  return { resolveHoverInfo };
}
