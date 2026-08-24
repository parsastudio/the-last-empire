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

export function getAlignmentColor(alignment: number): string {
  if (alignment >= 40) return "text-emerald-500 font-bold";
  if (alignment >= 15) return "text-emerald-400 font-semibold";
  if (alignment >= -15) return "text-muted-foreground font-medium";
  if (alignment >= -40) return "text-amber-500 font-semibold";
  return "text-rose-500 font-bold";
}

export function getTensionColor(tension: number): string {
  if (tension >= 60) return "text-rose-500 font-bold";
  if (tension >= 35) return "text-amber-500 font-semibold";
  return "text-emerald-400 font-medium";
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

  const rank = liveNation
    ? NationGettersUtility.getRank(liveNation.id, allNations, provincesMap)
    : 99;

  let stance: DiplomaticStance = "NORMAL_DIPLOMACY";
  let alignment = 0;
  let tension = 10;
  let posture: DiplomaticPosture = "NEUTRAL_COEXISTENCE";

  if (humanNation && liveNation && humanNation.id !== liveNation.id) {
    const directRel = humanNation.relations[liveNation.id];
    if (directRel) {
      stance = directRel.stance;
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
  }

  return {
    code: displayCode.toUpperCase(),
    name,
    flagCode: flagCode.toUpperCase(),
    rank,
    stance,
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
      alignment,
      tension,
    },
  };
}
