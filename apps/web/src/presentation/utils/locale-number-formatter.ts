export type AppLocale = "fa" | "en";

export class LocaleNumberFormatter {
  private static readonly formatters = new Map<string, Intl.NumberFormat>();

  private static getFormatter(
    locale: AppLocale,
    options: Intl.NumberFormatOptions,
  ): Intl.NumberFormat {
    const key = `${locale}_${JSON.stringify(options)}`;
    let formatter = this.formatters.get(key);
    if (!formatter) {
      const bcp47 = locale === "fa" ? "fa-IR" : "en-US";
      formatter = new Intl.NumberFormat(bcp47, options);
      this.formatters.set(key, formatter);
    }
    return formatter;
  }

  public static toDigits(
    input: number | string,
    locale: AppLocale = "fa",
  ): string {
    if (input === null || input === undefined) {
      return locale === "fa" ? "۰" : "0";
    }
    const num = typeof input === "string" ? Number(input) : input;
    if (isNaN(num)) {
      if (locale === "fa") {
        const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
        return String(input).replace(/\d/g, (d) => faDigits[Number(d)] ?? d);
      }
      return String(input);
    }
    return this.getFormatter(locale, { useGrouping: false }).format(num);
  }

  public static formatNumberWithCommas(
    value: number | string,
    locale: AppLocale = "fa",
  ): string {
    if (value === null || value === undefined) {
      return locale === "fa" ? "۰" : "0";
    }
    const num = typeof value === "string" ? Number(value) : value;
    if (isNaN(num)) {
      return this.toDigits(value, locale);
    }
    return this.getFormatter(locale, { useGrouping: true }).format(num);
  }

  public static formatCompactNumber(
    value: number,
    locale: AppLocale = "fa",
  ): string {
    if (isNaN(value) || value === null) {
      return locale === "fa" ? "۰" : "0";
    }
    return this.getFormatter(locale, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(value);
  }

  public static formatCurrency(
    value: number,
    compact = true,
    locale: AppLocale = "fa",
  ): string {
    if (isNaN(value) || value === null) {
      return locale === "fa" ? "۰ دلار" : "$0";
    }
    return this.getFormatter(locale, {
      style: "currency",
      currency: "USD",
      notation: compact ? "compact" : "standard",
      compactDisplay: "short",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(value);
  }

  public static formatSignedIncome(
    value: number,
    compact = true,
    locale: AppLocale = "fa",
  ): string {
    if (isNaN(value) || value === null) {
      return locale === "fa" ? "۰ دلار" : "$0";
    }
    return this.getFormatter(locale, {
      style: "currency",
      currency: "USD",
      notation: compact ? "compact" : "standard",
      compactDisplay: "short",
      signDisplay: "always",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(value);
  }

  public static formatPercent(
    value: number,
    decimals = 0,
    locale: AppLocale = "fa",
  ): string {
    if (isNaN(value) || value === null) {
      return locale === "fa" ? "۰٪" : "0%";
    }
    const ratio = value > 1 || value < -1 ? value / 100 : value;
    return this.getFormatter(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(ratio);
  }

  public static formatLevel(
    level: number,
    locale: AppLocale = "fa",
    decimals = 1,
  ): string {
    const safeLevel = Math.max(1, level);
    const formattedNum = this.getFormatter(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(safeLevel);
    return locale === "fa" ? `سطح ${formattedNum}` : `Level ${formattedNum}`;
  }

  public static formatPopulation(
    population: number,
    locale: AppLocale = "fa",
  ): string {
    const compactText = this.formatCompactNumber(population, locale);
    return locale === "fa" ? `${compactText} نفر` : `${compactText} citizens`;
  }
}
