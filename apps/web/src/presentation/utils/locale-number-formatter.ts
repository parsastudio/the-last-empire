export type AppLocale = "fa" | "en";

export class LocaleNumberFormatter {
  private static readonly faDigitFormatter = new Intl.NumberFormat("fa-IR", {
    useGrouping: false,
  });

  private static readonly enDigitFormatter = new Intl.NumberFormat("en-US", {
    useGrouping: false,
  });

  private static readonly faCommaFormatter = new Intl.NumberFormat("fa-IR", {
    useGrouping: true,
  });

  private static readonly enCommaFormatter = new Intl.NumberFormat("en-US", {
    useGrouping: true,
  });

  public static toDigits(
    input: number | string,
    locale: AppLocale = "fa",
  ): string {
    if (input === null || input === undefined) {
      return locale === "fa" ? "۰" : "0";
    }
    if (locale === "fa") {
      if (typeof input === "number") {
        return this.faDigitFormatter.format(input);
      }
      return input.replace(/\d/g, (d) =>
        this.faDigitFormatter.format(Number(d)),
      );
    }
    if (typeof input === "number") {
      return this.enDigitFormatter.format(input);
    }
    return String(input);
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
    return locale === "fa"
      ? this.faCommaFormatter.format(num)
      : this.enCommaFormatter.format(num);
  }

  public static formatCompactNumber(
    value: number,
    locale: AppLocale = "fa",
  ): string {
    if (isNaN(value) || value === null) {
      return locale === "fa" ? "۰" : "0";
    }

    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (locale === "en") {
      if (absValue >= 1e12) {
        const formatted = (absValue / 1e12).toFixed(1).replace(/\.0$/, "");
        return `${sign}${formatted}T`;
      }
      if (absValue >= 1e9) {
        const formatted = (absValue / 1e9).toFixed(1).replace(/\.0$/, "");
        return `${sign}${formatted}B`;
      }
      if (absValue >= 1e6) {
        const formatted = (absValue / 1e6).toFixed(1).replace(/\.0$/, "");
        return `${sign}${formatted}M`;
      }
      if (absValue >= 1e3) {
        const formatted = (absValue / 1e3).toFixed(1).replace(/\.0$/, "");
        return `${sign}${formatted}K`;
      }
      return `${sign}${Math.round(absValue)}`;
    }

    if (absValue >= 1e12) {
      const formatted = (absValue / 1e12).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toDigits(formatted, "fa")} تریلیارد`;
    }
    if (absValue >= 1e9) {
      const formatted = (absValue / 1e9).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toDigits(formatted, "fa")} میلیارد`;
    }
    if (absValue >= 1e6) {
      const formatted = (absValue / 1e6).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toDigits(formatted, "fa")} میلیون`;
    }
    if (absValue >= 1e3) {
      const formatted = (absValue / 1e3).toFixed(1).replace(/\.0$/, "");
      return `${sign}${this.toDigits(formatted, "fa")} هزار`;
    }

    return `${sign}${this.toDigits(Math.round(absValue), "fa")}`;
  }

  public static formatCurrency(
    value: number,
    compact = true,
    locale: AppLocale = "fa",
  ): string {
    if (compact) {
      const compactText = this.formatCompactNumber(value, locale);
      return locale === "fa" ? `${compactText} دلار` : `$${compactText}`;
    }

    const formattedWithCommas = this.formatNumberWithCommas(
      Math.round(value),
      locale,
    );
    return locale === "fa"
      ? `${formattedWithCommas} دلار`
      : `$${formattedWithCommas}`;
  }

  public static formatSignedIncome(
    value: number,
    compact = true,
    locale: AppLocale = "fa",
  ): string {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    const abs = Math.abs(value);
    if (compact) {
      const compactText = this.formatCompactNumber(abs, locale);
      return locale === "fa"
        ? `${sign}${compactText} دلار`
        : `${sign}$${compactText}`;
    }
    const formatted = this.formatNumberWithCommas(Math.round(abs), locale);
    return locale === "fa"
      ? `${sign}${formatted} دلار`
      : `${sign}$${formatted}`;
  }

  public static formatPercent(
    value: number,
    decimals = 0,
    locale: AppLocale = "fa",
  ): string {
    if (isNaN(value) || value === null) {
      return locale === "fa" ? "۰٪" : "0%";
    }
    const formattedNum =
      decimals > 0 ? value.toFixed(decimals) : Math.round(value);
    const digitString = this.toDigits(formattedNum, locale);
    return locale === "fa" ? `${digitString}٪` : `${digitString}%`;
  }

  public static formatLevel(
    level: number,
    locale: AppLocale = "fa",
    decimals = 1,
  ): string {
    const safeLevel = Math.max(1, level);
    const digitString = this.toDigits(safeLevel.toFixed(decimals), locale);
    return locale === "fa" ? `سطح ${digitString}` : `Level ${digitString}`;
  }

  public static formatPopulation(
    population: number,
    locale: AppLocale = "fa",
  ): string {
    const compactText = this.formatCompactNumber(population, locale);
    return locale === "fa" ? `${compactText} نفر` : `${compactText} citizens`;
  }
}
