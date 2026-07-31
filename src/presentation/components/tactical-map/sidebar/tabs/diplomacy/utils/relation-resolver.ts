import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/infrastructure/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryProfileData } from "../country-profile-stats";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  stance: string;
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
  const numericId = parseInt(code.replace("NATION_", ""), 10);

  const profile =
    findCountryProfileByCode(code) ||
    findCountryProfileById(code) ||
    (!isNaN(numericId) ? findCountryProfileById(numericId) : undefined) ||
    (liveNation
      ? findCountryProfileByCode(liveNation.id) ||
        findCountryProfileById(liveNation.id)
      : undefined);

  const realGdpNum = liveNation
    ? liveNation.gdp / 1e9
    : profile
      ? profile.gdp / 1e9
      : 50;
  const gdpBillion = Number.isInteger(realGdpNum)
    ? realGdpNum.toString()
    : realGdpNum.toFixed(1);

  const realPopNum = liveNation
    ? liveNation.population / 1e6
    : profile
      ? profile.population / 1e6
      : 10;
  const popMillion = Number.isInteger(realPopNum)
    ? realPopNum.toString()
    : realPopNum.toFixed(1);

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

  let govLabel = "دموکراسی";
  if (govType === "DICTATORSHIP") govLabel = "حکومت دیکتاتوری";
  else if (govType === "COMMUNISM") govLabel = "کمونیسم";
  else if (govType === "MONARCHY") govLabel = "پادشاهی";
  else if (govType === "FASCISM") govLabel = "فاشیسم";

  const militaryPower = liveNation
    ? liveNation.military.infantry * 1 +
      liveNation.military.airForce * 3 +
      liveNation.military.droneMissile * 2.5
    : (profile?.startingInfantry ?? 50) + (profile?.startingAirForce ?? 10) * 3;

  return {
    code: displayCode.toUpperCase(),
    name,
    flagCode,
    stance: "PEACE",
    opinion: 0,
    isTradeEmbargoed: false,
    description: `شناسنامه رسمی و آمار دفتری کشور ${name}.`,
    profileData: {
      gdp: `$${gdpBillion} میلیارد دلار`,
      population: `${popMillion} میلیون نفر`,
      techLevel: liveNation
        ? liveNation.military.techLevel
        : (profile?.startingTechLevel ?? 1),
      governmentType: govLabel,
      stability: liveNation ? liveNation.government.stability : 80,
      corruption: liveNation ? liveNation.government.corruption : 10,
      militaryStrength: `${Math.round(militaryPower).toLocaleString("fa-IR")} یگان`,
    },
  };
}
