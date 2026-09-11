import {
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  getNationGdp,
  LocaleNumberFormatter,
  AppLocale,
} from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

export interface NationAllyDetail {
  id: string;
  code: string;
  name: string;
  flagCode: string;
  flagEmoji: string;
  rank: number;
  gdpFormatted: string;
  militaryTech: number;
  industrialTech: number;
  allianceTypeLabel: string;
  isHuman: boolean;
  role: "GUARANTOR";
}

export class DiplomacyAlliesResolver {
  private static buildAllyDetail(
    nation: Nation,
    canonicalHuman: string,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    locale: AppLocale = "fa",
  ): NationAllyDetail {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    const profile = CountryRegistry.getCountry(canonicalId);
    const rank = NationGettersUtility.getRank(
      nation.id,
      nationsMap,
      provincesMap,
    );
    const gdp = getNationGdp(nation, provincesMap);
    const gdpFormatted = LocaleNumberFormatter.formatCurrency(
      gdp,
      true,
      locale,
    );
    const flagCode = nation.flagCode || canonicalId;
    const flagEmoji = getFlagEmoji(flagCode);

    const name =
      locale === "en"
        ? profile?.nameEn || nation.name
        : nation.name || profile?.nameFa || canonicalId;

    const allianceTypeLabel =
      locale === "en"
        ? "Committed Defense Guarantor (Direct War Intervention)"
        : "حامی دفاعی متعهد (ورود قطعی به جنگ)";

    return {
      id: canonicalId,
      code: canonicalId,
      name,
      flagCode,
      flagEmoji,
      rank,
      gdpFormatted,
      militaryTech: Number(nation.military.techLevel.toFixed(1)),
      industrialTech: Number(nation.industrialLevel.toFixed(1)),
      allianceTypeLabel,
      isHuman: canonicalId === canonicalHuman,
      role: "GUARANTOR",
    };
  }

  public static resolveAllies(
    targetNation: Nation | null,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    humanNationId?: string,
    locale: AppLocale = "fa",
  ): NationAllyDetail[] {
    if (!targetNation || !nationsMap) {
      return [];
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNation.id);
    const canonicalHuman = humanNationId
      ? CountryRegistry.resolveCanonicalId(humanNationId)
      : "";

    const seen = new Set<string>();
    const guarantors: NationAllyDetail[] = [];

    const targetGuarantorIds = targetNation.defenseGuarantorIds || [];
    for (let i = 0; i < targetGuarantorIds.length; i++) {
      const gId = targetGuarantorIds[i]!;
      const canonicalG = CountryRegistry.resolveCanonicalId(gId);
      if (canonicalG !== canonicalTarget && !seen.has(canonicalG)) {
        seen.add(canonicalG);
        const gNation = nationsMap[canonicalG] || nationsMap[gId];
        if (gNation && gNation.isAlive) {
          guarantors.push(
            this.buildAllyDetail(
              gNation,
              canonicalHuman,
              nationsMap,
              provincesMap,
              locale,
            ),
          );
        }
      }
    }

    return guarantors.sort((a, b) => a.rank - b.rank);
  }
}
