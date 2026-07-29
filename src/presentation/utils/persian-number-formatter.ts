export class PersianNumberFormatter {
  private static readonly englishToPersianMap: Record<string, string> = {
    "0": "۰",
    "1": "۱",
    "2": "۲",
    "3": "۳",
    "4": "۴",
    "5": "۵",
    "6": "۶",
    "7": "۷",
    "8": "۸",
    "9": "۹",
  };

  public static toPersianDigits(input: number | string): string {
    if (input === null || input === undefined) return "۰";
    const str = input.toString();
    return str.replace(/[0-9]/g, (w) => this.englishToPersianMap[w] || w);
  }

  public static formatCompactNumber(value: number): string {
    if (isNaN(value) || value === null) return "۰";

    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue >= 1e12) {
      const formatted = (absValue / 1e12).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toPersianDigits(formatted)}T`;
    }
    if (absValue >= 1e9) {
      const formatted = (absValue / 1e9).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toPersianDigits(formatted)}B`;
    }
    if (absValue >= 1e6) {
      const formatted = (absValue / 1e6).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toPersianDigits(formatted)}M`;
    }
    if (absValue >= 1e3) {
      const formatted = (absValue / 1e3).toFixed(0);
      return `${sign}${this.toPersianDigits(formatted)}k`;
    }

    return `${sign}${this.toPersianDigits(Math.round(absValue))}`;
  }

  public static formatCurrency(value: number, compact = true): string {
    if (compact) {
      const compactText = this.formatCompactNumber(value);
      return `$${compactText}`;
    }

    const formattedWithCommas = Math.round(value).toLocaleString("en-US");
    return `$${this.toPersianDigits(formattedWithCommas)}`;
  }

  public static formatSignedIncome(value: number): string {
    const compactText = this.formatCompactNumber(Math.abs(value));
    const sign = value >= 0 ? "+" : "-";
    return `(${sign}$${compactText})`;
  }
}
