import {
  LocaleNumberFormatter,
  AppLocale,
  CountryRegistry,
  MapTopologyRegistry,
} from "@geopolitics/domain";
import { NationPresenter } from "@/presentation/presenters/nation.presenter";

export class ProvinceNameFormatter {
  public static format(
    target?: number | string | null,
    locale: AppLocale = "fa",
    fallbackProvinceId?: number,
  ): string {
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
    }

    if (typeof target === "string" && target.trim().length > 0) {
      const trimmed = target.trim();
      const matchFa = trimmed.match(/^(?:استان\s+)?(.+?)(?:\s*\((\d+)\))?$/);

      if (matchFa) {
        const countryRaw = matchFa[1]?.trim();
        const num = matchFa[2] ? Number(matchFa[2]) : undefined;

        if (countryRaw) {
          const profile =
            CountryRegistry.getCountry(countryRaw) ||
            CountryRegistry.getAllProfiles().find(
              (p) =>
                p.nameFa === countryRaw ||
                p.nameEn.toLowerCase() === countryRaw.toLowerCase() ||
                p.code === countryRaw.toUpperCase(),
            );

          const countryCode = profile ? profile.code : countryRaw;
          return this.formatByParts(countryCode, num, locale);
        }
      }

      return trimmed;
    }

    if (resolvedId && resolvedId > 0) {
      return locale === "en"
        ? `Province #${resolvedId}`
        : `استان #${LocaleNumberFormatter.toDigits(resolvedId, "fa")}`;
    }

    return locale === "en" ? "Unknown Territory" : "استان نامشخص";
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

    if (totalCount <= 1 || !provinceIndex) {
      return locale === "en"
        ? `${countryName} Province`
        : `استان ${countryName}`;
    }

    const indexDisplay = LocaleNumberFormatter.toDigits(provinceIndex, locale);
    return locale === "en"
      ? `${countryName} Province (${indexDisplay})`
      : `استان ${countryName} (${indexDisplay})`;
  }
}
