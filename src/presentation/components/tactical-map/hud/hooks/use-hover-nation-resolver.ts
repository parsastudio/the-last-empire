import { useCallback, useMemo } from "react";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

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
          gdp: "۰ دلار",
          regionName: `منطقه ویژه سیستمی #${provinceId}`,
          regionPixels: "---",
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
      const realGdp = ownerNation ? getNationGdp(ownerNation) : 0;
      const realPop = ownerNation ? ownerNation.population : 0;
      const governmentType = ownerNation
        ? ownerNation.government.type
        : "DEMOCRACY";

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
        gdp: summary.gdpText,
        regionName: province.nameFa,
        regionPixels: NationPresentationMapper.formatTerritoryPixels(
          province.pixelCount,
        ),
      };
    },
    [syncedProvincesMap, nationsMap],
  );

  return { resolveHoverInfo };
}
