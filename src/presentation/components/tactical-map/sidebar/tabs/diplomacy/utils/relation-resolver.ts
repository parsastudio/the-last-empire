import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryProfileData } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PowerScoreCalculator } from "@/engine/diplomacy/diplomacy-domain.service";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  rank: number;
  stance: DiplomaticStance;
  opinion: number;
  description: string;
  isTradeEmbargoed?: boolean;
  profileData: CountryProfileData;
}

const powerCalculator = new PowerScoreCalculator();

export function getQualitativeOpinionLabel(opinion: number): string {
  if (opinion >= 60) return "بسیار دوستانه";
  if (opinion >= 20) return "دوستانه و همسو";
  if (opinion >= -19) return "بی‌طرف و متعادل";
  if (opinion >= -59) return "سرد و بدبین";
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
): DiplomaticRelation {
  const canonicalId = NationIdResolver.resolveCanonicalId(code);
  const numericId = NationIdResolver.resolveNumericId(canonicalId);

  const profile =
    findCountryProfileByCode(code) ||
    findCountryProfileById(numericId) ||
    (liveNation
      ? findCountryProfileByCode(liveNation.id) ||
        findCountryProfileById(liveNation.id)
      : undefined);

  const realGdpNum = liveNation
    ? liveNation.gdp
    : profile
      ? profile.gdp
      : 50000000000;

  const realPopNum = liveNation
    ? liveNation.population
    : profile
      ? profile.population
      : 10000000;

  const name = liveNation
    ? liveNation.name
    : profile
      ? profile.nameFa
      : `کشور ${code}`;

  const displayCode = profile
    ? profile.code
    : liveNation
      ? liveNation.id.replace("NATION_", "")
      : code;

  const flagCode = profile
    ? profile.flagCode
    : liveNation
      ? liveNation.flagCode
      : code;

  const govType = liveNation
    ? liveNation.government.type
    : (profile?.startingGovernment ?? "DEMOCRACY");

  const summary = NationPresentationMapper.formatNationSummary(
    displayCode,
    name,
    displayCode,
    flagCode,
    liveNation ? liveNation.rank : 99,
    realGdpNum,
    realPopNum,
    govType,
  );

  const infantry = liveNation
    ? liveNation.military.infantry
    : (profile?.startingInfantry ?? 50);
  const airForce = liveNation
    ? liveNation.military.airForce
    : (profile?.startingAirForce ?? 10);
  const drone = liveNation ? liveNation.military.droneMissile : 0;
  const techLevel = liveNation ? liveNation.military.techLevel : 1;

  const militaryPower = powerCalculator.calculateMilitaryScore(
    infantry,
    airForce,
    drone,
    techLevel,
  );

  return {
    code: summary.code,
    name: summary.name,
    flagCode: summary.flagCode,
    rank: summary.rank,
    stance: "NORMAL_DIPLOMACY",
    opinion: 0,
    isTradeEmbargoed: false,
    description: `شناسنامه رسمی و آمار دفتری کشور ${summary.name}.`,
    profileData: {
      gdp: summary.gdpText,
      population: summary.populationText,
      techLevel,
      governmentType: summary.governmentLabel,
      stability: liveNation ? liveNation.government.stability : 80,
      corruption: liveNation ? liveNation.government.corruption : 10,
      militaryStrength: `${PersianNumberFormatter.toPersianDigits(Math.round(militaryPower).toLocaleString("en-US"))} یگان`,
    },
  };
}
