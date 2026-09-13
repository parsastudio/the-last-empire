import { Nation, CountryRegistry, CountryProfile } from "@geopolitics/domain";
import { AppLocale } from "@/presentation/utils/locale-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import enCountries from "../../../messages/en/countries.json";
import faCountries from "../../../messages/fa/countries.json";
import enCommon from "../../../messages/en/common.json";
import faCommon from "../../../messages/fa/common.json";

export interface PresentedNation {
  id: string;
  canonicalId: string;
  name: string;
  flagCode: string;
  flagEmoji: string;
  nation: Nation | null;
  profile: CountryProfile | null;
}

const COUNTRIES_DICTIONARIES: Record<AppLocale, Record<string, string>> = {
  en: enCountries,
  fa: faCountries,
};

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
    const unknownText = locale === "en" ? enCommon.unknown : faCommon.unknown;
    if (!nationOrId) {
      return fallback || unknownText;
    }

    const rawId = typeof nationOrId === "string" ? nationOrId : nationOrId.id;
    const canonicalId = this.resolveCanonicalId(rawId);
    const dict = COUNTRIES_DICTIONARIES[locale] || faCountries;
    const localizedName = dict[canonicalId];

    if (localizedName) {
      return localizedName;
    }

    return fallback || canonicalId || unknownText;
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
    const unknownText = locale === "en" ? enCommon.unknown : faCommon.unknown;
    if (!target) {
      return {
        id: "",
        canonicalId: "",
        name: fallbackName || unknownText,
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
