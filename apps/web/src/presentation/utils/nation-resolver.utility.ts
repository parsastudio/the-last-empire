import { CountryRegistry, Nation, AppLocale } from "@geopolitics/domain";
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
    locale: AppLocale = "fa",
  ): ResolvedNationEntity {
    if (!rawId) {
      return {
        canonicalId: "",
        nation: null,
        name: locale === "en" ? "Unknown" : "نامشخص",
        flagCode: "IR",
        flagEmoji: "🌐",
      };
    }

    const canonicalId = CountryRegistry.resolveCanonicalId(rawId);
    const nation = nationsMap
      ? nationsMap[canonicalId] || nationsMap[rawId] || null
      : null;
    const profile = CountryRegistry.getCountry(canonicalId);

    const name =
      locale === "en"
        ? profile?.nameEn || nation?.name || canonicalId
        : nation?.name || profile?.nameFa || canonicalId;

    const flagCode = nation?.flagCode || profile?.flagCode || canonicalId;
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
