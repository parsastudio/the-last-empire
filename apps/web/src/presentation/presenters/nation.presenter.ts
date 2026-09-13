import { Nation, CountryRegistry, CountryProfile } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

export type CountryNameTranslator = (countryCode: string) => string;

export interface PresentedNation {
  id: string;
  canonicalId: string;
  name: string;
  flagCode: string;
  flagEmoji: string;
  nation: Nation | null;
  profile: CountryProfile | null;
}

export class NationPresenter {
  public static resolveCanonicalId(identifier: unknown): string {
    return CountryRegistry.resolveCanonicalId(identifier);
  }

  public static formatName(
    nationOrId: Nation | string | null | undefined,
    translator?: CountryNameTranslator,
    fallback?: string,
  ): string {
    if (!nationOrId) {
      return fallback || "";
    }

    const rawId = typeof nationOrId === "string" ? nationOrId : nationOrId.id;
    const canonicalId = this.resolveCanonicalId(rawId);

    if (translator) {
      const translated = translator(canonicalId);
      if (translated && translated !== canonicalId) {
        return translated;
      }
    }

    return fallback || canonicalId || "";
  }

  public static resolveFlagCode(
    nationOrId: Nation | string | null | undefined,
    defaultCode = "IR",
  ): string {
    if (!nationOrId) return defaultCode;
    const rawId = typeof nationOrId === "string" ? nationOrId : nationOrId.id;
    const canonicalId = this.resolveCanonicalId(rawId);
    const profile = CountryRegistry.getCountry(canonicalId);
    const flagFromNation =
      typeof nationOrId === "object" ? nationOrId.flagCode : undefined;

    return flagFromNation || profile?.flagCode || canonicalId || defaultCode;
  }

  public static present(
    target: Nation | string | null | undefined,
    nationsMap?: Record<string, Nation>,
    translator?: CountryNameTranslator,
    fallbackName?: string,
  ): PresentedNation {
    if (!target) {
      return {
        id: "",
        canonicalId: "",
        name: fallbackName || "",
        flagCode: "IR",
        flagEmoji: "🌐",
        nation: null,
        profile: null,
      };
    }

    const rawId = typeof target === "string" ? target : target.id;
    const canonicalId = this.resolveCanonicalId(rawId);

    const nation =
      typeof target === "object"
        ? target
        : nationsMap
          ? nationsMap[canonicalId] || nationsMap[rawId] || null
          : null;

    const profile = CountryRegistry.getCountry(canonicalId) || null;
    const name = this.formatName(
      nation || canonicalId,
      translator,
      fallbackName,
    );
    const flagCode = this.resolveFlagCode(nation || canonicalId);
    const flagEmoji = getFlagEmoji(flagCode);

    return {
      id: rawId,
      canonicalId,
      name,
      flagCode,
      flagEmoji,
      nation,
      profile,
    };
  }
}
