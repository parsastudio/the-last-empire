export class PersianNumberFormatter {
  private static readonly digitFormatter = new Intl.NumberFormat("fa-IR", {
    useGrouping: false,
  });

  private static readonly commaFormatter = new Intl.NumberFormat("fa-IR", {
    useGrouping: true,
  });

  public static toPersianDigits(input: number | string): string {
    if (input === null || input === undefined) return "۰";
    if (typeof input === "number") {
      return this.digitFormatter.format(input);
    }
    return input.replace(/\d/g, (d) => this.digitFormatter.format(Number(d)));
  }

  public static formatNumberWithCommas(value: number | string): string {
    if (value === null || value === undefined) return "۰";
    const num = typeof value === "string" ? Number(value) : value;
    if (isNaN(num)) return this.toPersianDigits(value);
    return this.commaFormatter.format(num);
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

    const formattedWithCommas = this.commaFormatter.format(Math.round(value));
    return `${formattedWithCommas} دلار`;
  }

  public static formatSignedIncome(value: number): string {
    const absValue = Math.abs(value);
    const compactText = this.formatCurrency(absValue, true);
    const sign = value >= 0 ? "+" : "-";
    return `${sign}${compactText}`;
  }
}
