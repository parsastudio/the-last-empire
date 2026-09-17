import {
  CountryRegistry,
  Nation,
  DiplomaticStance,
  DiplomaticPosture,
  Province,
  CountryDefaultsUtility,
  getNationGdp,
  NationGettersUtility,
  NationRelationResolver,
} from "@geopolitics/domain";
import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/presentation/utils/locale-number-formatter";
import { GeopoliticalVectorCalculator } from "@geopolitics/game-engine";
import { CountryProfileData } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import {
  NationPresenter,
  CountryNameTranslator,
} from "@/presentation/presenters/nation.presenter";
import {
  getAlignmentColor,
  getTensionColor,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-appearance.utility";

export { getAlignmentColor, getTensionColor };

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  rank: number;
  stance: DiplomaticStance;
  alignment: number;
  tension: number;
  posture: DiplomaticPosture;
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
  translator?: CountryNameTranslator,
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

  const presented = NationPresenter.present(
    liveNation || code,
    allNations,
    translator,
  );

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
    const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNation.id);
    const targetDirectRel =
      liveNation.relations?.[canonicalHuman] ||
      liveNation.relations?.[humanNation.id];

    const vector = GeopoliticalVectorCalculator.calculate(
      liveNation,
      humanNation,
      allNations,
      provincesMap,
    );

    if (targetDirectRel) {
      stance = targetDirectRel.stance || "NORMAL_DIPLOMACY";
      alignment =
        targetDirectRel.alignment !== undefined
          ? targetDirectRel.alignment
          : vector.alignment;
      tension =
        targetDirectRel.tension !== undefined
          ? targetDirectRel.tension
          : vector.tension;
    } else {
      alignment = vector.alignment;
      tension = vector.tension;
    }

    posture = vector.posture;

    const umbrella = NationRelationResolver.resolveBilateralUmbrellaState(
      humanNation,
      liveNation,
    );

    isEmergencyProtectorate = umbrella.isEmergencyGuarantorOfHuman;
    hasSecurityGuarantee = umbrella.hasSecurityGuarantee;
  }

  const liveGuarantors = liveNation
    ? NationGettersUtility.getLiveDefenseGuarantors(liveNation, allNations)
    : [];

  const firstGuarantor = liveGuarantors[0];
  const guarantorName = firstGuarantor
    ? NationPresenter.formatName(firstGuarantor, translator)
    : undefined;

  const humanTech = humanNation?.military.techLevel ?? 1.0;
  const isArmsEligible =
    tension < 50 && stance !== "WAR" && techLevel > humanTech;

  return {
    code: presented.canonicalId.toUpperCase(),
    name: presented.name,
    flagCode: presented.flagCode.toUpperCase(),
    rank,
    stance,
    alignment,
    tension,
    posture,
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
