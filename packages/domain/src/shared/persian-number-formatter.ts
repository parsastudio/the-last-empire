import { LocaleNumberFormatter } from "@/domain/shared/locale-number-formatter";

export class PersianNumberFormatter {
  public static toPersianDigits(input: number | string): string {
    return LocaleNumberFormatter.toDigits(input, "fa");
  }

  public static formatNumberWithCommas(value: number | string): string {
    return LocaleNumberFormatter.formatNumberWithCommas(value, "fa");
  }

  public static formatCompactNumber(value: number): string {
    return LocaleNumberFormatter.formatCompactNumber(value, "fa");
  }

  public static formatCurrency(value: number, compact = true): string {
    return LocaleNumberFormatter.formatCurrency(value, compact, "fa");
  }

  public static formatSignedIncome(value: number, compact = true): string {
    return LocaleNumberFormatter.formatSignedIncome(value, compact, "fa");
  }
}
