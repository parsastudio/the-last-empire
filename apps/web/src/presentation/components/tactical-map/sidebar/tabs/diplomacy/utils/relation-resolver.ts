import {
  CountryRegistry,
  Nation,
  DiplomaticStance,
  DiplomaticPosture,
  Province,
  CountryDefaultsUtility,
  getNationGdp,
  NationGettersUtility,
} from "@geopolitics/domain";
import { GeopoliticalVectorCalculator } from "@geopolitics/game-engine";
import { CountryProfileData } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  rank: number;
  stance: DiplomaticStance;
  opinion: number;
  alignment: number;
  tension: number;
  posture: DiplomaticPosture;
  postureLabel: string;
  profileData: CountryProfileData;
}

export function getPostureLabel(posture: DiplomaticPosture): string {
  switch (posture) {
    case "NATURAL_ALLY":
      return "متحد طبیعی و همسو";
    case "OPPORTUNISTIC_PREDATOR":
      return "شکارچی و رقیب متخاصم";
    case "WARY_BUFFER":
      return "مدافع محتاط و نگران";
    case "NEUTRAL_COEXISTENCE":
    default:
      return "همزیستی مسالمت‌آمیز";
  }
}

export function getPostureBadgeClass(posture: DiplomaticPosture): string {
  switch (posture) {
    case "NATURAL_ALLY":
      return "bg-gdp/15 text-gdp border-gdp/30";
    case "OPPORTUNISTIC_PREDATOR":
      return "bg-rose-500/15 text-rose-500 border-rose-500/30";
    case "WARY_BUFFER":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "NEUTRAL_COEXISTENCE":
    default:
      return "bg-secondary text-muted-foreground border-border/60";
  }
}

export function getQualitativeOpinionLabel(opinion: number): string {
  if (opinion >= 60) return "بسیار دوستانه و همسو";
  if (opinion >= 20) return "دوستانه و مسالمت‌آمیز";
  if (opinion >= -19) return "بی‌طرف و متعادل";
  if (opinion >= -59) return "سرد و متشنج";
  return "خصمانه و متخاصم";
}

export function getQualitativeOpinionColor(opinion: number): string {
  if (opinion >= 60) return "text-emerald-500 font-bold";
  if (opinion >= 20) return "text-emerald-400 font-semibold";
  if (opinion >= -19) return "text-muted-foreground font-medium";
  if (opinion >= -59) return "text-amber-500 font-semibold";
  return "text-rose-500 font-bold";
}

export function resolveProfileRelation(
  code: string,
  liveNation?: Nation | null,
  humanNation?: Nation | null,
  allNations?: Record<string, Nation>,
  provincesMap?: Record<string, Province>,
): DiplomaticRelation {
  const profile = CountryRegistry.getCountry(code);
  const fallback = CountryDefaultsUtility.getFallbackProfile(code, profile);

  const realGdpNum = liveNation
    ? getNationGdp(liveNation, provincesMap)
    : fallback.gdp;
  const realPopNum = liveNation
    ? NationGettersUtility.getPopulation(liveNation.id, provincesMap)
    : fallback.population;
  const name = liveNation ? liveNation.name : fallback.nameFa;
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

  let stance: DiplomaticStance = "NORMAL_DIPLOMACY";
  let unifiedScore = 0;
  let alignment = 0;
  let tension = 10;
  let posture: DiplomaticPosture = "NEUTRAL_COEXISTENCE";

  if (humanNation && liveNation && humanNation.id !== liveNation.id) {
    const directRel = humanNation.relations[liveNation.id];
    if (directRel) {
      stance = directRel.stance;
      unifiedScore = directRel.opinion;
    }
    const vector = GeopoliticalVectorCalculator.calculate(
      humanNation,
      liveNation,
      allNations,
      provincesMap,
    );
    alignment = vector.alignment;
    tension = vector.tension;
    posture = vector.posture;

    const calculatedUnified = Math.round(
      vector.alignment * 0.65 - vector.tension * 0.35,
    );
    unifiedScore = Math.max(-100, Math.min(100, calculatedUnified));
  }

  return {
    code: displayCode.toUpperCase(),
    name,
    flagCode: flagCode.toUpperCase(),
    rank: liveNation ? liveNation.rank : 99,
    stance,
    opinion: unifiedScore,
    alignment,
    tension,
    posture,
    postureLabel: getPostureLabel(posture),
    profileData: {
      gdp: PersianNumberFormatter.formatCurrency(realGdpNum, true),
      population: NationPresentationMapper.formatPopulation(realPopNum),
      techLevel,
      governmentType: liveNation
        ? liveNation.government.type
        : fallback.startingGovernment,
      stability: liveNation ? liveNation.government.stability : 50,
      opinion: unifiedScore,
      alignment,
      tension,
      posture,
    },
  };
}
