import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/presentation/utils/locale-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";
import enSelectNation from "@/messages/en/select-nation.json";
import faSelectNation from "@/messages/fa/select-nation.json";

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
    const dict = (locale === "en" ? enSelectNation : faSelectNation).powerTiers;
    if (gdp >= 10e12) return dict.superpower;
    if (gdp >= 1e12) return dict.hegemon;
    if (gdp >= 200e9) return dict.transRegional;
    return dict.regional;
  }

  public static formatPopulation(
    population: number,
    locale: AppLocale = "fa",
  ): string {
    return LocaleNumberFormatter.formatPopulation(population, locale);
  }

  public static formatNationSummary(
    id: string,
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
    const displayName = NationPresenter.formatName(cleanCode, locale);

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
