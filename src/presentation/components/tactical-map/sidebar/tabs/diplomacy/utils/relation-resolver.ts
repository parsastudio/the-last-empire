import { findCountryProfileByCode } from "@/domain/map/countries";
import { DiplomaticRelation } from "../diplomacy-detail-view";

export function resolveProfileRelation(code: string): DiplomaticRelation {
  const profile = findCountryProfileByCode(code);
  const rawGdp = profile ? profile.gdp / 1e9 : 50;
  const gdpBillion = Number.isInteger(rawGdp)
    ? rawGdp.toString()
    : rawGdp.toFixed(1);

  const rawPop = profile ? profile.population / 1e6 : 10;
  const popMillion = Number.isInteger(rawPop)
    ? rawPop.toString()
    : rawPop.toFixed(1);

  const name = profile ? profile.nameFa : `کشور ${code}`;
  const flagCode = profile ? profile.flagCode : code;
  const govType = profile?.startingGovernment ?? "DEMOCRACY";

  let govLabel = "دموکراسی";
  if (govType === "DICTATORSHIP") govLabel = "حکومت دیکتاتوری";
  else if (govType === "COMMUNISM") govLabel = "کمونیسم";
  else if (govType === "MONARCHY") govLabel = "پادشاهی";
  else if (govType === "FASCISM") govLabel = "فاشیسم";

  return {
    code: code.toUpperCase(),
    name,
    flagCode,
    stance: code.toUpperCase() === "USA" ? "WAR" : "PEACE",
    opinion: code.toUpperCase() === "USA" ? -75 : 0,
    description: `شناسنامه رسمی و آمار دفتری کشور ${name}.`,
    profileData: {
      gdp: `$${gdpBillion} میلیارد دلار`,
      population: `${popMillion} میلیون نفر`,
      techLevel: profile?.startingTechLevel ?? 1,
      governmentType: govLabel,
      stability: 80,
      corruption: 10,
    },
  };
}
