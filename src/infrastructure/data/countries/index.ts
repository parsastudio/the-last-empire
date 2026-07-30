import { CountryProfile } from "@/domain/map/countries/types";
import { africaProfiles } from "./africa";
import { americasProfiles } from "./americas";
import { asiaProfiles } from "./asia";
import { europeProfiles } from "./europe";
import { oceaniaProfiles } from "./oceania";

export type { CountryProfile };

export const ALL_COUNTRY_PROFILES: CountryProfile[] = [
  ...africaProfiles,
  ...americasProfiles,
  ...asiaProfiles,
  ...europeProfiles,
  ...oceaniaProfiles,
];

export function findCountryProfileByCode(
  code: string,
): CountryProfile | undefined {
  if (!code) return undefined;
  const clean = code.toUpperCase().replace("NATION_", "").trim();

  return ALL_COUNTRY_PROFILES.find(
    (c) => c.code.toUpperCase() === clean || c.flagCode.toUpperCase() === clean,
  );
}

export function findCountryProfileById(
  id: number | string,
): CountryProfile | undefined {
  if (typeof id === "number" || !isNaN(Number(id))) {
    const num = typeof id === "number" ? id : Number(id);
    const matched = ALL_COUNTRY_PROFILES.find((_, idx) => idx + 11 === num);
    if (matched) return matched;
  }
  return findCountryProfileByCode(id.toString());
}
