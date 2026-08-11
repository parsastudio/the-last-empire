import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryProfileData } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/country-profile-stats";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  rank: number;
  stance: DiplomaticStance;
  opinion: number;
  isTradeEmbargoed?: boolean;
  profileData: CountryProfileData;
}

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
  const profile = CountryRegistry.getCountry(code);

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

  const techLevel = liveNation ? liveNation.military.techLevel : 1;

  return {
    code: displayCode.toUpperCase(),
    name,
    flagCode: flagCode.toUpperCase(),
    rank: liveNation ? liveNation.rank : 99,
    stance: "NORMAL_DIPLOMACY",
    opinion: 0,
    isTradeEmbargoed: false,
    profileData: {
      gdp: PersianNumberFormatter.formatCurrency(realGdpNum, true),
      population: NationPresentationMapper.formatPopulation(realPopNum),
      techLevel,
      governmentType: liveNation ? liveNation.government.type : "DEMOCRACY",
      stability: liveNation ? liveNation.government.stability : 80,
      corruption: liveNation ? liveNation.government.corruption : 10,
    },
  };
}
