"use client";

import { useMemo, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/presentation/utils/locale-number-formatter";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";
import { ProvinceNameFormatter } from "@/presentation/utils/province-name-formatter";
import { Nation } from "@geopolitics/domain";

export function useLocaleFormatter() {
  const currentLocale = useLocale() as AppLocale;
  const locale: AppLocale = currentLocale === "en" ? "en" : "fa";
  const isRtl = locale === "fa";

  const tCountries = useTranslations("countries");
  const tMapProvince = useTranslations("map.province");

  const countryTranslator = useCallback(
    (code: string) => {
      return tCountries.has(code) ? tCountries(code) : code;
    },
    [tCountries],
  );

  const formatCountryName = useCallback(
    (nationOrId: Nation | string | null | undefined, fallback?: string) => {
      return NationPresenter.formatName(
        nationOrId,
        countryTranslator,
        fallback,
      );
    },
    [countryTranslator],
  );

  const formatProvinceName = useCallback(
    (target?: number | string | null, fallbackProvinceId?: number) => {
      return ProvinceNameFormatter.format(
        target,
        {
          tProvince: (key, values) => tMapProvince(key, values),
          formatCountryName,
          toDigits: (val) => LocaleNumberFormatter.toDigits(val, locale),
        },
        fallbackProvinceId,
      );
    },
    [tMapProvince, formatCountryName, locale],
  );

  return useMemo(() => {
    return {
      locale,
      isRtl,
      countryTranslator,
      formatCountryName,
      formatProvinceName,
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
  }, [locale, isRtl, countryTranslator, formatCountryName, formatProvinceName]);
}
