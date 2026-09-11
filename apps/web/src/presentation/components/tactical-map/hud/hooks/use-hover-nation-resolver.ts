import { useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
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
  MapTopologyRegistry,
} from "@geopolitics/domain";

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
  const locale = useLocale();

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

      const profile = CountryRegistry.getCountry(canonicalOwnerId);
      const realName = ownerNation
        ? locale === "en"
          ? profile?.nameEn || ownerNation.name
          : ownerNation.name
        : t("unknownCountry");

      const flagCode = ownerNation ? ownerNation.flagCode : "IR";
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

      let stanceLabel = t("normalDiplomacy");
      let rawStance: DiplomaticStance = "NORMAL_DIPLOMACY";
      let isOwnCountry = false;
      let hasSecurityGuarantee = false;

      if (humanNationId && nationsMap && ownerNation) {
        const canonicalHuman =
          CountryRegistry.resolveCanonicalId(humanNationId);
        if (canonicalOwnerId === canonicalHuman) {
          stanceLabel = t("yourEmpire");
          isOwnCountry = true;
        } else {
          const humanNation =
            nationsMap[canonicalHuman] || nationsMap[humanNationId];
          const stance = NationRelationResolver.getStance(
            humanNation?.relations,
            canonicalOwnerId,
          );
          rawStance = stance;
          if (stance === "WAR") stanceLabel = t("warState");
          else if (stance === "STRATEGIC_PARTNERSHIP")
            stanceLabel = t("strategicPartnership");
          else if (stance === "NON_AGGRESSION_PACT")
            stanceLabel = t("nonAggression");
          else stanceLabel = t("normalDiplomacy");

          const isEmergencyGuarantorOfHuman =
            Boolean(humanNation?.securityGuarantorId) &&
            CountryRegistry.resolveCanonicalId(
              humanNation?.securityGuarantorId,
            ) === canonicalOwnerId &&
            Boolean(humanNation?.isEmergencyProtectorate);

          const isHumanEmergencyGuarantorOfTarget =
            Boolean(ownerNation.securityGuarantorId) &&
            CountryRegistry.resolveCanonicalId(
              ownerNation.securityGuarantorId,
            ) === canonicalHuman &&
            Boolean(ownerNation.isEmergencyProtectorate);

          const isDefenseGuarantorOfHuman = (
            humanNation?.defenseGuarantorIds || []
          ).some(
            (id) => CountryRegistry.resolveCanonicalId(id) === canonicalOwnerId,
          );

          const isHumanDefenseGuarantorOfTarget = (
            ownerNation.defenseGuarantorIds || []
          ).some(
            (id) => CountryRegistry.resolveCanonicalId(id) === canonicalHuman,
          );

          if (isEmergencyGuarantorOfHuman) {
            stanceLabel = t("underSuperpowerProtectorate");
            hasSecurityGuarantee = true;
          } else if (isHumanEmergencyGuarantorOfTarget) {
            stanceLabel = t("targetUnderYourProtectorate");
            hasSecurityGuarantee = true;
          } else if (isDefenseGuarantorOfHuman) {
            stanceLabel = t("defenseGuarantorOfHuman");
            hasSecurityGuarantee = true;
          } else if (isHumanDefenseGuarantorOfTarget) {
            stanceLabel = t("humanDefenseGuarantorOfTarget");
            hasSecurityGuarantee = true;
          }
        }
      }

      const gdpSharePct =
        realGdp > 0 ? Math.round((provinceGdp / realGdp) * 100) : 0;

      const regionName = MapTopologyRegistry.getNameFa(
        province.provinceId,
        t("unknownRegion"),
      );

      return {
        name: realName,
        code: canonicalOwnerId,
        flagCode,
        rank: realRank,
        gdpRank: realGdpRank,
        stance: stanceLabel,
        rawStance,
        isOwnCountry,
        regionName,
        regionGdpText: PersianNumberFormatter.formatCurrency(provinceGdp, true),
        totalGdpText: PersianNumberFormatter.formatCurrency(realGdp, true),
        gdpSharePct,
        hasSecurityGuarantee,
      };
    },
    [provincesMap, nationsMap, humanNationId, locale, t],
  );

  return { resolveHoverInfo };
}
