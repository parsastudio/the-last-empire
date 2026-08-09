import { useCallback, useMemo } from "react";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";

interface UseHoverNationResolverProps {
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useHoverNationResolver({
  provincesMap,
  nationsMap,
}: UseHoverNationResolverProps) {
  const syncedProvincesMap = useMemo(() => {
    if (!provincesMap) return {};
    console.log(
      "[useHoverNationResolver] Syncing provincesMap with live bitpacked buffer...",
    );
    const buffer = BitPackedGridState.getInstance().getBuffer();
    return ProvincePixelCalculator.syncProvincesMapPixelCounts(
      buffer,
      provincesMap,
    );
  }, [provincesMap]);

  const resolveHoverInfo = useCallback(
    (provinceId: number): HoverCountryInfo | null => {
      if (provinceId <= 0 || !syncedProvincesMap) return null;

      const province = syncedProvincesMap[provinceId.toString()];
      if (!province) {
        console.warn(
          "[useHoverNationResolver] Province ID not found in syncedProvincesMap:",
          provinceId,
        );
        return null;
      }

      const ownerNation = nationsMap
        ? nationsMap[province.ownerNationId]
        : null;

      const realName = ownerNation ? ownerNation.name : "کشور ناشناخته";
      const flagCode = ownerNation ? ownerNation.flagCode : "IR";
      const realRank = ownerNation ? ownerNation.rank : 99;
      const realGdp = province.gdp;

      const summary = NationPresentationMapper.formatNationSummary(
        province.ownerNationId,
        realName,
        province.ownerNationId,
        flagCode,
        realRank,
        realGdp,
        province.population,
        "DEMOCRACY",
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
