"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { LocaleNumberFormatter, AppLocale } from "@geopolitics/domain";

export function useLocaleFormatter() {
  const currentLocale = useLocale() as AppLocale;
  const locale: AppLocale = currentLocale === "en" ? "en" : "fa";
  const isRtl = locale === "fa";

  return useMemo(() => {
    return {
      locale,
      isRtl,
      toDigits: (input: number | string) =>
        LocaleNumberFormatter.toDigits(input, locale),
      formatNumber: (value: number | string) =>
        LocaleNumberFormatter.formatNumberWithCommas(value, locale),
      formatCompact: (value: number) =>
        LocaleNumberFormatter.formatCompactNumber(value, locale),
      formatCurrency: (value: number, compact = true) =>
        LocaleNumberFormatter.formatCurrency(value, compact, locale),
      formatSignedIncome: (value: number, compact = true) =>
        LocaleNumberFormatter.formatSignedIncome(value, compact, locale),
      formatPercent: (value: number, decimals = 0) =>
        LocaleNumberFormatter.formatPercent(value, decimals, locale),
      formatLevel: (level: number, decimals = 1) =>
        LocaleNumberFormatter.formatLevel(level, locale, decimals),
      formatPopulation: (population: number) =>
        LocaleNumberFormatter.formatPopulation(population, locale),
    };
  }, [locale, isRtl]);
}
