import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { getGovernmentTypeLabel } from "@/domain/politics/government-label.utility";

export interface FormattedNationPresentation {
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
  governmentLabel: string;
}

export class NationPresentationMapper {
  public static getPowerLabel(gdp: number): string {
    if (gdp >= 10e12) return "ابرقدرت جهانی";
    if (gdp >= 1e12) return "قدرت برتر صنعتی";
    if (gdp >= 200e9) return "قدرت فرامنطقه‌ای";
    return "قدرت منطقه‌ای";
  }

  public static formatPopulation(population: number): string {
    return PersianNumberFormatter.formatCompactNumber(population) + " نفر";
  }

  public static formatTerritoryPixels(pixels: number): string {
    const formatted = Math.round(pixels).toLocaleString("en-US");
    return `${PersianNumberFormatter.toPersianDigits(formatted)} پیکسل`;
  }

  public static formatNationSummary(
    id: string,
    nameFa: string,
    code: string,
    flagCode: string,
    rank: number,
    gdp: number,
    population: number,
    governmentType: string,
    treasury?: number,
  ): FormattedNationPresentation {
    const computedTreasury = treasury ?? Math.floor(gdp * 0.05);

    return {
      id,
      name: nameFa,
      code: code.toUpperCase(),
      flagCode: flagCode.toUpperCase(),
      flagEmoji: getFlagEmoji(flagCode || code),
      rank,
      powerLabel: this.getPowerLabel(gdp),
      gdpText: PersianNumberFormatter.formatCurrency(gdp, true),
      populationText: this.formatPopulation(population),
      treasuryText: PersianNumberFormatter.formatCurrency(computedTreasury),
      governmentLabel: getGovernmentTypeLabel(governmentType),
    };
  }
}
