import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";
import { SecurityFeeCalculatorUtility } from "@/domain/diplomacy/security-fee-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export type SecurityGuaranteeRejectReasonCode =
  | "CANNOT_GUARANTEE_SELF"
  | "AI_SUPERPOWER_RESTRICTION"
  | "DIRECT_WAR_ACTIVE"
  | "ALREADY_UNDER_PROTECTORATE"
  | "TENSION_TOO_HIGH"
  | "GDP_BELOW_MINIMUM"
  | "GDP_ABOVE_MAXIMUM"
  | "TECH_NOT_SUPERIOR"
  | "ALREADY_ACTIVE_GUARANTOR"
  | "MAX_PACTS_EXHAUSTED"
  | "GEOGRAPHIC_REACH_DENIED"
  | "INSUFFICIENT_FUNDS";

export interface SecurityGuaranteeValidationResult {
  isValid: boolean;
  reasonCode?: SecurityGuaranteeRejectReasonCode;
  gdpRatio: number;
  techDiff: number;
  tension: number;
  isGdpValid: boolean;
  isTechValid: boolean;
  isTensionValid: boolean;
  isNotWar: boolean;
  hasSlotAvailable: boolean;
  canAffordCost: boolean;
  isEmergencyProtectorate?: boolean;
}

export class SecurityGuaranteeValidator {
  public static readonly MAX_DEFENSE_PACTS = 2;
  public static readonly MIN_DEFENSE_GDP_RATIO = 0.7;
  public static readonly MAX_DEFENSE_GDP_RATIO = 5.0;

  public static validate(
    client: Nation,
    guarantor: Nation,
    provincesMap?: Record<string, ProvinceDynamicState>,
    isEmergency = false,
    allNations?: Record<string, Nation>,
    rankMap?: Map<string, number>,
  ): SecurityGuaranteeValidationResult {
    const canonicalClient = CountryRegistry.resolveCanonicalId(client.id);
    const canonicalGuarantor = CountryRegistry.resolveCanonicalId(guarantor.id);

    if (canonicalClient === canonicalGuarantor) {
      return {
        isValid: false,
        reasonCode: "CANNOT_GUARANTEE_SELF",
        gdpRatio: 1,
        techDiff: 0,
        tension: 0,
        isGdpValid: false,
        isTechValid: false,
        isTensionValid: true,
        isNotWar: true,
        hasSlotAvailable: false,
        canAffordCost: false,
        isEmergencyProtectorate: isEmergency,
      };
    }

    const clientGdp = getNationGdp(client, provincesMap);
    const guarantorGdp = getNationGdp(guarantor, provincesMap);
    const gdpRatio = Number((guarantorGdp / Math.max(1, clientGdp)).toFixed(2));

    const rel = NationRelationResolver.getRelation(
      client.relations,
      canonicalGuarantor,
    );
    const tension = rel ? (rel.tension ?? 10) : 10;
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
    const isNotWar = stance !== "WAR";

    if (client.isAi && allNations) {
      const aliveCount = Object.values(allNations).filter(
        (n) => n.isAlive,
      ).length;
      const top20Threshold = Math.ceil(aliveCount * 0.2);
      const clientRank =
        rankMap?.get(canonicalClient) ??
        rankMap?.get(client.id) ??
        NationGettersUtility.getRank(client.id, allNations, provincesMap);

      if (clientRank <= top20Threshold) {
        return {
          isValid: false,
          reasonCode: "AI_SUPERPOWER_RESTRICTION",
          gdpRatio,
          techDiff: 0,
          tension,
          isGdpValid: false,
          isTechValid: false,
          isTensionValid: true,
          isNotWar,
          hasSlotAvailable: false,
          canAffordCost: false,
          isEmergencyProtectorate: isEmergency,
        };
      }
    }

    if (isEmergency) {
      const clientTech = client.military.techLevel || 1.0;
      const guarantorTech = guarantor.military.techLevel || 1.0;
      const techDiff = Number((guarantorTech - clientTech).toFixed(1));

      const isAlreadyUnderOtherProtectorate =
        Boolean(client.securityGuarantorId) &&
        Boolean(client.isEmergencyProtectorate) &&
        CountryRegistry.resolveCanonicalId(client.securityGuarantorId) !==
          canonicalGuarantor;

      const isGdpValid = gdpRatio >= 1.0;
      const isTechValid = techDiff > 0;
      const isTensionValid = tension < 50;

      let reasonCode: SecurityGuaranteeRejectReasonCode | undefined = undefined;
      if (!isNotWar) {
        reasonCode = "DIRECT_WAR_ACTIVE";
      } else if (isAlreadyUnderOtherProtectorate) {
        reasonCode = "ALREADY_UNDER_PROTECTORATE";
      } else if (!isTensionValid) {
        reasonCode = "TENSION_TOO_HIGH";
      } else if (!isGdpValid) {
        reasonCode = "GDP_BELOW_MINIMUM";
      } else if (!isTechValid) {
        reasonCode = "TECH_NOT_SUPERIOR";
      }

      const isValid =
        isGdpValid &&
        isTechValid &&
        isNotWar &&
        isTensionValid &&
        !isAlreadyUnderOtherProtectorate;

      return {
        isValid,
        reasonCode,
        gdpRatio,
        techDiff,
        tension,
        isGdpValid,
        isTechValid,
        isTensionValid,
        isNotWar,
        hasSlotAvailable: !isAlreadyUnderOtherProtectorate,
        canAffordCost: true,
        isEmergencyProtectorate: true,
      };
    }

    const existingGuarantors = client.defenseGuarantorIds || [];
    const isAlreadyGuarantor = existingGuarantors.includes(canonicalGuarantor);
    const hasSlotAvailable =
      existingGuarantors.length < this.MAX_DEFENSE_PACTS && !isAlreadyGuarantor;

    const isGdpValid =
      gdpRatio >= this.MIN_DEFENSE_GDP_RATIO &&
      gdpRatio <= this.MAX_DEFENSE_GDP_RATIO;

    const signingCost =
      SecurityFeeCalculatorUtility.calculateSigningCost(guarantorGdp);
    const canAffordCost = client.treasury >= signingCost;

    const proximity = GeopoliticalReachResolver.getProximityTier(
      client,
      guarantor,
      provincesMap,
    );
    const isReachable = proximity !== "NONE";

    let reasonCode: SecurityGuaranteeRejectReasonCode | undefined = undefined;
    if (isAlreadyGuarantor) {
      reasonCode = "ALREADY_ACTIVE_GUARANTOR";
    } else if (!hasSlotAvailable) {
      reasonCode = "MAX_PACTS_EXHAUSTED";
    } else if (!isNotWar) {
      reasonCode = "DIRECT_WAR_ACTIVE";
    } else if (!isGdpValid) {
      reasonCode =
        gdpRatio < this.MIN_DEFENSE_GDP_RATIO
          ? "GDP_BELOW_MINIMUM"
          : "GDP_ABOVE_MAXIMUM";
    } else if (!isReachable) {
      reasonCode = "GEOGRAPHIC_REACH_DENIED";
    } else if (!canAffordCost) {
      reasonCode = "INSUFFICIENT_FUNDS";
    }

    const isValid =
      hasSlotAvailable &&
      isNotWar &&
      isGdpValid &&
      isReachable &&
      canAffordCost;

    return {
      isValid,
      reasonCode,
      gdpRatio,
      techDiff: 0,
      tension,
      isGdpValid,
      isTechValid: true,
      isTensionValid: true,
      isNotWar,
      hasSlotAvailable,
      canAffordCost,
      isEmergencyProtectorate: false,
    };
  }
}
