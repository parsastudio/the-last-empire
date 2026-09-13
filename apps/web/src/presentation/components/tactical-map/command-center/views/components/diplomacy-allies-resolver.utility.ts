import {
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  getNationGdp,
} from "@geopolitics/domain";
import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/presentation/utils/locale-number-formatter";
import {
  NationPresenter,
  CountryNameTranslator,
} from "@/presentation/presenters/nation.presenter";

export interface NationAllyDetail {
  id: string;
  code: string;
  name: string;
  flagCode: string;
  flagEmoji: string;
  rank: number;
  gdpFormatted: string;
  militaryTech: number;
  isHuman: boolean;
}

export class DiplomacyAlliesResolver {
  private static buildAllyDetail(
    nation: Nation,
    canonicalHuman: string,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    translator?: CountryNameTranslator,
    locale: AppLocale = "fa",
  ): NationAllyDetail {
    const presented = NationPresenter.present(nation, nationsMap, translator);
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

    return {
      id: presented.canonicalId,
      code: presented.canonicalId,
      name: presented.name,
      flagCode: presented.flagCode,
      flagEmoji: presented.flagEmoji,
      rank,
      gdpFormatted,
      militaryTech: Number(nation.military.techLevel.toFixed(1)),
      isHuman: presented.canonicalId === canonicalHuman,
    };
  }

  public static resolveAllies(
    targetNation: Nation | null,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    humanNationId?: string,
    translator?: CountryNameTranslator,
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
              translator,
              locale,
            ),
          );
        }
      }
    }

    return guarantors.sort((a, b) => a.rank - b.rank);
  }
}
