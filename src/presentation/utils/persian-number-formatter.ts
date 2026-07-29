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
      return `${sign}${this.toPersianDigits(formatted)} تریلیارد`;
    }
    if (absValue >= 1e9) {
      const formatted = (absValue / 1e9).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toPersianDigits(formatted)} میلیارد`;
    }
    if (absValue >= 1e6) {
      const formatted = (absValue / 1e6).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toPersianDigits(formatted)} میلیون`;
    }
    if (absValue >= 1e3) {
      const formatted = (absValue / 1e3).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toPersianDigits(formatted)} هزار`;
    }

    return `${sign}${this.toPersianDigits(Math.round(absValue))}`;
  }

  public static formatCurrency(value: number, compact = true): string {
    if (compact) {
      const compactText = this.formatCompactNumber(value);
      return `${compactText} دلار`;
    }

    const formattedWithCommas = Math.round(value).toLocaleString("en-US");
    return `${this.toPersianDigits(formattedWithCommas)} دلار`;
  }

  public static formatSignedIncome(value: number): string {
    const absValue = Math.abs(value);
    const compactText = this.formatCurrency(absValue, true);
    const sign = value >= 0 ? "+" : "-";
    return `${sign}${compactText}`;
  }
}
