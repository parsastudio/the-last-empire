import { useCallback } from "react";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import {
  getNationGdp,
  getProvinceGdp,
} from "@/domain/nation/gdp-calculator.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { CountryRegistry } from "@/domain/data/countries";
import {
  NationGettersUtility,
  NationRelationResolver,
  DiplomaticStance,
} from "@geopolitics/domain";

interface UseHoverNationResolverProps {
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useHoverNationResolver({
  provincesMap,
  nationsMap,
  humanNationId,
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

      const realName = ownerNation ? ownerNation.name : "کشور نامشخص";
      const flagCode = ownerNation ? ownerNation.flagCode : "IR";
      const realRank = ownerNation
        ? NationGettersUtility.getRank(ownerNation.id, nationsMap, provincesMap)
        : 99;
      const realGdp = ownerNation ? getNationGdp(ownerNation, provincesMap) : 0;

      const provinceGdp = getProvinceGdp(
        province,
        ownerNation?.equipmentTechLevel ?? 1.0,
      );

      const activeSlotsPct =
        province.maxSlots > 0
          ? Math.round((province.factoriesCount / province.maxSlots) * 100)
          : 100;

      let stanceLabel = "دیپلماسی عادی";
      let rawStance: DiplomaticStance = "NORMAL_DIPLOMACY";
      let isOwnCountry = false;

      if (humanNationId && nationsMap && ownerNation) {
        const canonicalHuman =
          CountryRegistry.resolveCanonicalId(humanNationId);
        if (canonicalOwnerId === canonicalHuman) {
          stanceLabel = "امپراتوری شما";
          isOwnCountry = true;
        } else {
          const humanNation =
            nationsMap[canonicalHuman] || nationsMap[humanNationId];
          const stance = NationRelationResolver.getStance(
            humanNation?.relations,
            canonicalOwnerId,
          );
          rawStance = stance;
          if (stance === "WAR") stanceLabel = "وضعیت نبرد";
          else if (stance === "STRATEGIC_PARTNERSHIP")
            stanceLabel = "شراکت استراتژیک";
          else if (stance === "NON_AGGRESSION_PACT") stanceLabel = "عدم تخاصم";
          else stanceLabel = "دیپلماسی عادی";
        }
      }

      const gdpSharePct =
        realGdp > 0 ? Math.round((provinceGdp / realGdp) * 100) : 0;

      return {
        name: realName,
        code: canonicalOwnerId,
        flagCode,
        rank: realRank,
        stance: stanceLabel,
        rawStance,
        isOwnCountry,
        regionName: province.nameFa,
        regionGdpText: PersianNumberFormatter.formatCurrency(provinceGdp, true),
        regionCapacityPercentage: activeSlotsPct,
        totalGdpText: PersianNumberFormatter.formatCurrency(realGdp, true),
        gdpSharePct,
      };
    },
    [provincesMap, nationsMap, humanNationId],
  );

  return { resolveHoverInfo };
}
