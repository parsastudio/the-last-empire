import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/presentation/utils/locale-number-formatter";
import { FlagEmojiUtility } from "@/domain/shared/utils/flag-emoji.utility";
import { ECONOMY_CONFIG } from "@/domain/economy/economy.config";

export type PowerTierKey =
  | "superpower"
  | "hegemon"
  | "transRegional"
  | "regional";

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
    return FlagEmojiUtility.getFlagEmoji(code);
  }

  public static getPowerTierKey(gdp: number): PowerTierKey {
    if (gdp >= 10e12) return "superpower";
    if (gdp >= 1e12) return "hegemon";
    if (gdp >= 200e9) return "transRegional";
    return "regional";
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
    treasury: number | undefined,
    displayName: string,
    powerLabel: string,
    locale: AppLocale = "fa",
  ): FormattedNationSummary {
    const computedTreasury =
      treasury ?? Math.floor(gdp * ECONOMY_CONFIG.STARTING_TREASURY_RATIO);
    const cleanCode = code.toUpperCase();

    return {
      id: cleanCode,
      name: displayName,
      code: cleanCode,
      flagCode: (flagCode || cleanCode).toUpperCase(),
      flagEmoji: this.getFlagEmoji(flagCode || cleanCode),
      rank,
      powerLabel,
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
