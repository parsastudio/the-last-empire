import {
  LocaleNumberFormatter,
  AppLocale,
  CountryRegistry,
} from "@geopolitics/domain";

export class ProvinceNameFormatter {
  public static format(
    rawName?: string | null,
    locale: AppLocale = "fa",
    provinceId?: number,
  ): string {
    if (!rawName || rawName.trim().length === 0) {
      return locale === "en"
        ? provinceId
          ? `Province #${provinceId}`
          : "Unknown Territory"
        : provinceId
          ? `استان #${LocaleNumberFormatter.toDigits(provinceId, "fa")}`
          : "استان نامشخص";
    }

    const trimmed = rawName.trim();

    if (locale === "fa") {
      const formattedDigits = LocaleNumberFormatter.toDigits(trimmed, "fa");
      if (formattedDigits.startsWith("استان")) {
        return formattedDigits;
      }
      return `استان ${formattedDigits}`;
    }

    const cleanFa = trimmed.replace(/^استان\s+/, "");
    const matchCountryNumber = cleanFa.match(/^(.+?)(?:\s*\((\d+)\))?$/);

    if (matchCountryNumber) {
      const countryRaw = matchCountryNumber[1]?.trim() || cleanFa;
      const num = matchCountryNumber[2];
      const profile =
        CountryRegistry.getCountry(countryRaw) ||
        CountryRegistry.getAllProfiles().find(
          (p) => p.nameFa === countryRaw || p.code === countryRaw,
        );

      const countryNameEn = profile?.nameEn || countryRaw;
      return num
        ? `${countryNameEn} Province (${num})`
        : `${countryNameEn} Province`;
    }

    return `${cleanFa} Province`;
  }
}
