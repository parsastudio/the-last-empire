import { CountryRegistry, Nation } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

export interface ResolvedNationEntity {
  canonicalId: string;
  nation: Nation | null;
  name: string;
  flagCode: string;
  flagEmoji: string;
}

export class NationResolverUtility {
  public static resolve(
    rawId?: string | null,
    nationsMap?: Record<string, Nation>,
  ): ResolvedNationEntity {
    if (!rawId) {
      return {
        canonicalId: "",
        nation: null,
        name: "نامشخص",
        flagCode: "IR",
        flagEmoji: "🌐",
      };
    }

    const canonicalId = CountryRegistry.resolveCanonicalId(rawId);
    const nation = nationsMap
      ? nationsMap[canonicalId] || nationsMap[rawId] || null
      : null;
    const name = nation ? nation.name : rawId;
    const flagCode = nation?.flagCode || canonicalId;
    const flagEmoji = getFlagEmoji(flagCode);

    return {
      canonicalId,
      nation,
      name,
      flagCode,
      flagEmoji,
    };
  }
}
