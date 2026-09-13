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
import { NationPresenter } from "@/presentation/presenters/nation.presenter";
import enDiplomacy from "../../../../../../messages/en/diplomacy.json";
import faDiplomacy from "../../../../../../messages/fa/diplomacy.json";

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
    const presented = NationPresenter.present(nation, nationsMap, locale);
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

    const dict = locale === "en" ? enDiplomacy : faDiplomacy;
    const allianceTypeLabel = dict.alliesBox.committedAllyLabel;

    return {
      id: presented.canonicalId,
      code: presented.canonicalId,
      name: presented.name,
      flagCode: presented.flagCode,
      flagEmoji: presented.flagEmoji,
      rank,
      gdpFormatted,
      militaryTech: Number(nation.military.techLevel.toFixed(1)),
      industrialTech: Number(nation.industrialLevel.toFixed(1)),
      allianceTypeLabel,
      isHuman: presented.canonicalId === canonicalHuman,
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
