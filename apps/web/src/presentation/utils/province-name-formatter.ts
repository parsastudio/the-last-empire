import { CountryRegistry, MapTopologyRegistry } from "@geopolitics/domain";
import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/presentation/utils/locale-number-formatter";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";
import enMap from "@/messages/en/map.json";
import faMap from "@/messages/fa/map.json";

export class ProvinceNameFormatter {
  public static format(
    target?: number | string | null,
    locale: AppLocale = "fa",
    fallbackProvinceId?: number,
  ): string {
    const dict = (locale === "en" ? enMap : faMap).province;
    const resolvedId =
      typeof target === "number"
        ? target
        : fallbackProvinceId && fallbackProvinceId > 0
          ? fallbackProvinceId
          : typeof target === "string" && /^\d+$/.test(target.trim())
            ? Number(target.trim())
            : undefined;

    if (resolvedId && resolvedId > 0) {
      const topology = MapTopologyRegistry.getTopology(resolvedId);
      if (topology?.countryId) {
        return this.formatByParts(
          topology.countryId,
          topology.provinceIndex ?? 1,
          locale,
        );
      }
      return dict.fallback.replace(
        "{id}",
        LocaleNumberFormatter.toDigits(resolvedId, locale),
      );
    }

    if (typeof target === "string" && target.trim().length > 0) {
      const trimmed = target.trim();
      const canonical = CountryRegistry.resolveCanonicalId(trimmed);
      if (canonical) {
        return this.formatByParts(canonical, undefined, locale);
      }
      return trimmed;
    }

    return dict.unknown;
  }

  public static formatByParts(
    countryIdentifier: string,
    provinceIndex?: number,
    locale: AppLocale = "fa",
  ): string {
    const canonical = CountryRegistry.resolveCanonicalId(countryIdentifier);
    const countryName = NationPresenter.formatName(
      canonical || countryIdentifier,
      locale,
    );
    const totalCount = MapTopologyRegistry.getCountryProvinceCount(canonical);
    const dict = (locale === "en" ? enMap : faMap).province;

    if (totalCount <= 1 || !provinceIndex) {
      return dict.single.replace("{country}", countryName);
    }

    const indexDisplay = LocaleNumberFormatter.toDigits(provinceIndex, locale);
    return dict.indexed
      .replace("{country}", countryName)
      .replace("{index}", indexDisplay);
  }
}
