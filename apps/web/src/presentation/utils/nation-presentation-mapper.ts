import { CountryRegistry } from "@/domain/data/countries";
import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/presentation/utils/locale-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

export interface FormattedNationSummary {
  id: string;
  name: string;
  code: string;
  flagCode: string;
  flagEmoji: string;
  rank: number;
  powerLabel: string;
  gdpText: string;
  populationText: string;
  treasuryText: string;
}

export class NationPresentationMapper {
  public static getFlagEmoji(code: string | number): string {
    return getFlagEmoji(String(code));
  }

  public static getPowerLabel(gdp: number, locale: AppLocale = "fa"): string {
    if (locale === "en") {
      if (gdp >= 10e12) return "Global Superpower";
      if (gdp >= 1e12) return "Leading Industrial Hegemon";
      if (gdp >= 200e9) return "Trans-Regional Power";
      return "Regional Power";
    }

    if (gdp >= 10e12) return "ابرقدرت جهانی";
    if (gdp >= 1e12) return "قدرت برتر صنعتی";
    if (gdp >= 200e9) return "قدرت فرامنطقه‌ای";
    return "قدرت منطقه‌ای";
  }

  public static formatPopulation(
    population: number,
    locale: AppLocale = "fa",
  ): string {
    return LocaleNumberFormatter.formatPopulation(population, locale);
  }

  public static formatNationSummary(
    id: string,
    nameFa: string,
    code: string,
    flagCode: string,
    rank: number,
    gdp: number,
    population: number,
    treasury?: number,
    locale: AppLocale = "fa",
  ): FormattedNationSummary {
    const computedTreasury = treasury ?? Math.floor(gdp * 0.05);
    const cleanCode = code.toUpperCase();
    const profile = CountryRegistry.getCountry(cleanCode);

    const displayName =
      locale === "en"
        ? profile?.nameEn || cleanCode
        : nameFa || profile?.nameFa || cleanCode;

    return {
      id: cleanCode,
      name: displayName,
      code: cleanCode,
      flagCode: (flagCode || cleanCode).toUpperCase(),
      flagEmoji: this.getFlagEmoji(flagCode || cleanCode),
      rank,
      powerLabel: this.getPowerLabel(gdp, locale),
      gdpText: LocaleNumberFormatter.formatCurrency(gdp, true, locale),
      populationText: this.formatPopulation(population, locale),
      treasuryText: LocaleNumberFormatter.formatCurrency(
        computedTreasury,
        true,
        locale,
      ),
    };
  }
}
