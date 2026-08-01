import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/infrastructure/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryProfileData } from "../country-profile-stats";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";
import { getGovernmentTypeLabel } from "@/domain/politics/government-label.utility";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  stance: DiplomaticStance;
  opinion: number;
  description: string;
  isTradeEmbargoed?: boolean;
  profileData: CountryProfileData;
}

export function resolveProfileRelation(
  code: string,
  liveNation?: Nation | null,
): DiplomaticRelation {
  const canonicalId = NationIdResolver.resolveCanonicalId(code);
  const numericId = parseInt(canonicalId.replace("NATION_", ""), 10);

  const profile =
    findCountryProfileByCode(code) ||
    findCountryProfileById(code) ||
    (!isNaN(numericId) ? findCountryProfileById(numericId) : undefined) ||
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

  const popMillion = (realPopNum / 1e6).toFixed(1);

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

  const govLabel = getGovernmentTypeLabel(govType);

  const militaryPower = liveNation
    ? liveNation.military.infantry * 1 +
      liveNation.military.airForce * 3 +
      liveNation.military.droneMissile * 2.5
    : (profile?.startingInfantry ?? 50) + (profile?.startingAirForce ?? 10) * 3;

  return {
    code: displayCode.toUpperCase(),
    name,
    flagCode,
    stance: "NORMAL_DIPLOMACY",
    opinion: 0,
    isTradeEmbargoed: false,
    description: `شناسنامه رسمی و آمار دفتری کشور ${name}.`,
    profileData: {
      gdp: PersianNumberFormatter.formatCurrency(realGdpNum, true),
      population: `${PersianNumberFormatter.toPersianDigits(popMillion)} میلیون نفر`,
      techLevel: liveNation
        ? liveNation.military.techLevel
        : (profile?.startingTechLevel ?? 1),
      governmentType: govLabel,
      stability: liveNation ? liveNation.government.stability : 80,
      corruption: liveNation ? liveNation.government.corruption : 10,
      militaryStrength: `${PersianNumberFormatter.toPersianDigits(Math.round(militaryPower).toLocaleString("en-US"))} یگان`,
    },
  };
}
