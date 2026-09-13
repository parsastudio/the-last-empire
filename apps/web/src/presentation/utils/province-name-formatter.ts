import { CountryRegistry, MapTopologyRegistry } from "@geopolitics/domain";

export interface ProvinceFormatterOptions {
  tProvince: (
    key: "single" | "indexed" | "fallback" | "unknown",
    values?: Record<string, string | number>,
  ) => string;
  formatCountryName: (countryId: string) => string;
  toDigits?: (val: number | string) => string;
}

export class ProvinceNameFormatter {
  public static format(
    target: number | string | null | undefined,
    options: ProvinceFormatterOptions,
    fallbackProvinceId?: number,
  ): string {
    const { tProvince, formatCountryName, toDigits = String } = options;

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
        const canonical = CountryRegistry.resolveCanonicalId(
          topology.countryId,
        );
        const countryName = formatCountryName(canonical || topology.countryId);
        const totalCount =
          MapTopologyRegistry.getCountryProvinceCount(canonical);
        const index = topology.provinceIndex ?? 1;

        if (totalCount <= 1) {
          return tProvince("single", { country: countryName });
        }

        return tProvince("indexed", {
          country: countryName,
          index: toDigits(index),
        });
      }

      return tProvince("fallback", { id: toDigits(resolvedId) });
    }

    if (typeof target === "string" && target.trim().length > 0) {
      const trimmed = target.trim();
      const canonical = CountryRegistry.resolveCanonicalId(trimmed);
      if (canonical) {
        const countryName = formatCountryName(canonical);
        return tProvince("single", { country: countryName });
      }
      return trimmed;
    }

    return tProvince("unknown");
  }
}
