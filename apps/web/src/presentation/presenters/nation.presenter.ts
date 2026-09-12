import {
  Nation,
  CountryRegistry,
  CountryProfile,
  AppLocale,
} from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

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

  public static getProfile(identifier: unknown): CountryProfile | undefined {
    const canonical = this.resolveCanonicalId(identifier);
    return CountryRegistry.getCountry(canonical);
  }

  public static formatName(
    nationOrId: Nation | string | null | undefined,
    locale: AppLocale = "fa",
    fallback?: string,
  ): string {
    if (!nationOrId) {
      if (fallback) return fallback;
      return locale === "en" ? "Unknown" : "نامشخص";
    }

    const rawId = typeof nationOrId === "string" ? nationOrId : nationOrId.id;
    const canonicalId = this.resolveCanonicalId(rawId);
    const profile = CountryRegistry.getCountry(canonicalId);
    const nation = typeof nationOrId === "object" ? nationOrId : null;

    if (locale === "en") {
      return (
        profile?.nameEn ||
        nation?.name ||
        (rawId ? fallback || canonicalId : fallback || "Unknown")
      );
    }

    return (
      nation?.name ||
      profile?.nameFa ||
      (rawId ? fallback || canonicalId : fallback || "نامشخص")
    );
  }

  public static resolveFlagCode(
    nationOrId: Nation | string | null | undefined,
    defaultCode = "IR",
  ): string {
    if (!nationOrId) return defaultCode;
    const nation = typeof nationOrId === "object" ? nationOrId : null;
    const rawId = typeof nationOrId === "string" ? nationOrId : nation.id;
    const canonicalId = this.resolveCanonicalId(rawId);
    const profile = CountryRegistry.getCountry(canonicalId);

    return nation?.flagCode || profile?.flagCode || canonicalId || defaultCode;
  }

  public static resolveFlagEmoji(
    nationOrId: Nation | string | null | undefined,
  ): string {
    const flagCode = this.resolveFlagCode(nationOrId);
    return getFlagEmoji(flagCode);
  }

  public static present(
    target: Nation | string | null | undefined,
    nationsMap?: Record<string, Nation>,
    locale: AppLocale = "fa",
    fallbackName?: string,
  ): PresentedNation {
    if (!target) {
      return {
        id: "",
        canonicalId: "",
        name: fallbackName || (locale === "en" ? "Unknown" : "نامشخص"),
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
    const name = this.formatName(nation || canonicalId, locale, fallbackName);
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
