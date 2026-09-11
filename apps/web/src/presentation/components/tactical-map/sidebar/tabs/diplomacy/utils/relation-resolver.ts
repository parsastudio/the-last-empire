import {
  CountryRegistry,
  Nation,
  DiplomaticStance,
  DiplomaticPosture,
  Province,
  CountryDefaultsUtility,
  getNationGdp,
  NationGettersUtility,
  LocaleNumberFormatter,
  AppLocale,
} from "@geopolitics/domain";
import { GeopoliticalVectorCalculator } from "@geopolitics/game-engine";
import { CountryProfileData } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import {
  getPostureLabel,
  getPostureBadgeClass,
  getAlignmentColor,
  getTensionColor,
} from "./relation-appearance.utility";

export {
  getPostureLabel,
  getPostureBadgeClass,
  getAlignmentColor,
  getTensionColor,
};

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  rank: number;
  stance: DiplomaticStance;
  alignment: number;
  tension: number;
  posture: DiplomaticPosture;
  postureLabel: string;
  hasSecurityGuarantee: boolean;
  isEmergencyProtectorate: boolean;
  profileData: CountryProfileData;
}

export function resolveProfileRelation(
  code: string,
  liveNation?: Nation | null,
  humanNation?: Nation | null,
  allNations?: Record<string, Nation>,
  provincesMap?: Record<string, Province>,
  locale: AppLocale = "fa",
): DiplomaticRelation {
  const profile = CountryRegistry.getCountry(code);
  const fallback = CountryDefaultsUtility.getFallbackProfile(code, profile);

  const realGdpNum = liveNation
    ? getNationGdp(liveNation, provincesMap)
    : fallback.gdp;
  const realPopNum = liveNation
    ? NationGettersUtility.getPopulation(liveNation.id, provincesMap)
    : fallback.population;

  const name =
    locale === "en"
      ? profile?.nameEn || liveNation?.name || fallback.nameEn
      : liveNation?.name || profile?.nameFa || fallback.nameFa;

  const displayCode = profile
    ? profile.code
    : liveNation
      ? liveNation.id
      : fallback.code;

  const flagCode = profile
    ? profile.flagCode
    : liveNation
      ? liveNation.flagCode
      : fallback.flagCode;

  const techLevel = liveNation
    ? liveNation.military.techLevel
    : fallback.startingTechLevel;

  const industrialLevel = liveNation
    ? liveNation.industrialLevel
    : fallback.industrialLevel;

  const rank = liveNation
    ? NationGettersUtility.getRank(liveNation.id, allNations, provincesMap)
    : 99;

  let stance: DiplomaticStance = "NORMAL_DIPLOMACY";
  let alignment = 0;
  let tension = 10;
  let posture: DiplomaticPosture = "NEUTRAL_COEXISTENCE";
  let hasSecurityGuarantee = false;
  let isEmergencyProtectorate = false;

  if (humanNation && liveNation && humanNation.id !== liveNation.id) {
    const directRel =
      humanNation.relations[liveNation.id] ||
      humanNation.relations[CountryRegistry.resolveCanonicalId(liveNation.id)];
    if (directRel) {
      stance = directRel.stance;
    }
    const vector = GeopoliticalVectorCalculator.calculate(
      liveNation,
      humanNation,
      allNations,
      provincesMap,
    );
    alignment = vector.alignment;
    tension = vector.tension;
    posture = vector.posture;

    const targetCanonical = CountryRegistry.resolveCanonicalId(liveNation.id);

    const isEmergencyGuarantorOfHuman =
      Boolean(humanNation.securityGuarantorId) &&
      CountryRegistry.resolveCanonicalId(humanNation.securityGuarantorId) ===
        targetCanonical &&
      Boolean(humanNation.isEmergencyProtectorate);

    if (isEmergencyGuarantorOfHuman) {
      isEmergencyProtectorate = true;
    }

    const hasDefensePactWithTarget = (
      humanNation.defenseGuarantorIds || []
    ).some((id) => CountryRegistry.resolveCanonicalId(id) === targetCanonical);

    if (hasDefensePactWithTarget) {
      hasSecurityGuarantee = true;
    }
  }

  const firstDefenseGuarantorId = liveNation?.defenseGuarantorIds?.[0];
  const emergencyGuarantorId = liveNation?.securityGuarantorId;

  const guarantorNation =
    emergencyGuarantorId && allNations
      ? allNations[CountryRegistry.resolveCanonicalId(emergencyGuarantorId)] ||
        allNations[emergencyGuarantorId]
      : firstDefenseGuarantorId && allNations
        ? allNations[
            CountryRegistry.resolveCanonicalId(firstDefenseGuarantorId)
          ] || null
        : null;

  const guarantorProfile = guarantorNation
    ? CountryRegistry.getCountry(guarantorNation.id)
    : null;

  const guarantorName = guarantorNation
    ? locale === "en"
      ? guarantorProfile?.nameEn || guarantorNation.name
      : guarantorNation.name
    : undefined;

  const humanTech = humanNation?.military.techLevel ?? 1.0;
  const isArmsEligible =
    tension < 50 && stance !== "WAR" && techLevel > humanTech;

  return {
    code: displayCode.toUpperCase(),
    name,
    flagCode: flagCode.toUpperCase(),
    rank,
    stance,
    alignment,
    tension,
    posture,
    postureLabel: getPostureLabel(posture, locale),
    hasSecurityGuarantee,
    isEmergencyProtectorate,
    profileData: {
      gdp: LocaleNumberFormatter.formatCurrency(realGdpNum, true, locale),
      population: LocaleNumberFormatter.formatPopulation(realPopNum, locale),
      techLevel,
      industrialLevel,
      governmentType: liveNation
        ? liveNation.government.type
        : fallback.startingGovernment,
      stability: liveNation ? liveNation.government.stability : 50,
      tension,
      guarantorName,
      isEmergencyProtectorate: Boolean(liveNation?.isEmergencyProtectorate),
      isArmsEligible,
    },
  };
}
