import {
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  getNationGdp,
  PersianNumberFormatter,
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
}

export class DiplomacyAlliesResolver {
  private static buildAllyDetail(
    nation: Nation,
    allianceTypeLabel: string,
    canonicalHuman: string,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): NationAllyDetail {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    const rank = NationGettersUtility.getRank(
      nation.id,
      nationsMap,
      provincesMap,
    );
    const gdp = getNationGdp(nation, provincesMap);
    const gdpFormatted = PersianNumberFormatter.formatCurrency(gdp, true);
    const flagCode = nation.flagCode || canonicalId;
    const flagEmoji = getFlagEmoji(flagCode);

    return {
      id: canonicalId,
      code: canonicalId,
      name: nation.name,
      flagCode,
      flagEmoji,
      rank,
      gdpFormatted,
      militaryTech: Number(nation.military.techLevel.toFixed(1)),
      industrialTech: Number(nation.industrialLevel.toFixed(1)),
      allianceTypeLabel,
      isHuman: canonicalId === canonicalHuman,
    };
  }

  public static resolveAllies(
    targetNation: Nation | null,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    humanNationId?: string,
  ): NationAllyDetail[] {
    if (!targetNation || !nationsMap) {
      return [];
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNation.id);
    const canonicalHuman = humanNationId
      ? CountryRegistry.resolveCanonicalId(humanNationId)
      : "";

    const seen = new Set<string>();
    const allies: NationAllyDetail[] = [];

    for (const [otherId, rel] of Object.entries(targetNation.relations || {})) {
      if (rel.stance === "STRATEGIC_PARTNERSHIP") {
        const canonicalOther = CountryRegistry.resolveCanonicalId(otherId);
        if (canonicalOther !== canonicalTarget && !seen.has(canonicalOther)) {
          seen.add(canonicalOther);
          const otherNation = nationsMap[canonicalOther] || nationsMap[otherId];
          if (otherNation && otherNation.isAlive) {
            allies.push(
              this.buildAllyDetail(
                otherNation,
                "شراکت استراتژیک",
                canonicalHuman,
                nationsMap,
                provincesMap,
              ),
            );
          }
        }
      }
    }

    for (const other of Object.values(nationsMap)) {
      if (other.isAlive && other.id !== targetNation.id) {
        const cOther = CountryRegistry.resolveCanonicalId(other.id);
        if (!seen.has(cOther)) {
          const rel =
            other.relations?.[canonicalTarget] ||
            other.relations?.[targetNation.id];
          if (rel?.stance === "STRATEGIC_PARTNERSHIP") {
            seen.add(cOther);
            allies.push(
              this.buildAllyDetail(
                other,
                "شراکت استراتژیک",
                canonicalHuman,
                nationsMap,
                provincesMap,
              ),
            );
          }
        }
      }
    }

    return allies.sort((a, b) => a.rank - b.rank);
  }
}
