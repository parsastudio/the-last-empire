import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import {
  getNationGdp,
  getProvinceGdp,
} from "@/domain/nation/gdp-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";
import {
  NationGettersUtility,
  NationRelationResolver,
  DiplomaticStance,
} from "@geopolitics/domain";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface UseHoverNationResolverProps {
  provincesMap?: Record<string, ProvinceDynamicState>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useHoverNationResolver({
  provincesMap,
  nationsMap,
  humanNationId,
}: UseHoverNationResolverProps) {
  const t = useTranslations("map.hud.stances");
  const { formatProvinceName, formatCurrency, countryTranslator } =
    useLocaleFormatter();

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

      const canonicalOwnerId = NationPresenter.resolveCanonicalId(
        province.ownerNationId,
      );
      const ownerNation = nationsMap
        ? nationsMap[canonicalOwnerId] || nationsMap[province.ownerNationId]
        : null;

      const presented = NationPresenter.present(
        ownerNation || canonicalOwnerId,
        nationsMap,
        countryTranslator,
        t("unknownCountry"),
      );

      const realRank = ownerNation
        ? NationGettersUtility.getRank(ownerNation.id, nationsMap, provincesMap)
        : 99;
      const realGdpRank = ownerNation
        ? NationGettersUtility.getGdpRank(
            ownerNation.id,
            nationsMap,
            provincesMap,
          )
        : 99;
      const realGdp = ownerNation ? getNationGdp(ownerNation, provincesMap) : 0;

      const provinceGdp = getProvinceGdp(
        province,
        ownerNation?.equipmentTechLevel ?? 1.0,
      );

      let rawStance: DiplomaticStance = "NORMAL_DIPLOMACY";
      let isOwnCountry = false;
      let hasSecurityGuarantee = false;

      if (humanNationId && nationsMap && ownerNation) {
        const canonicalHuman =
          CountryRegistry.resolveCanonicalId(humanNationId);
        if (canonicalOwnerId === canonicalHuman) {
          isOwnCountry = true;
        } else {
          const humanNation =
            nationsMap[canonicalHuman] || nationsMap[humanNationId];
          rawStance = NationRelationResolver.getStance(
            humanNation?.relations,
            canonicalOwnerId,
          );

          const umbrella = NationRelationResolver.resolveBilateralUmbrellaState(
            humanNation,
            ownerNation,
          );
          hasSecurityGuarantee = umbrella.hasSecurityGuarantee;
        }
      }

      const gdpSharePct =
        realGdp > 0 ? Math.round((provinceGdp / realGdp) * 100) : 0;

      const regionName = formatProvinceName(province.provinceId);

      return {
        name: presented.name,
        code: presented.canonicalId,
        flagCode: presented.flagCode,
        rank: realRank,
        gdpRank: realGdpRank,
        rawStance,
        isOwnCountry,
        regionName,
        regionGdpText: formatCurrency(provinceGdp, true),
        totalGdpText: formatCurrency(realGdp, true),
        gdpSharePct,
        hasSecurityGuarantee,
      };
    },
    [
      provincesMap,
      nationsMap,
      humanNationId,
      countryTranslator,
      formatCurrency,
      formatProvinceName,
      t,
    ],
  );

  return { resolveHoverInfo };
}
