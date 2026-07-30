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
    (c) =>
      c.code.toUpperCase() === clean ||
      c.flagCode.toUpperCase() === clean ||
      c.id.toString() === clean,
  );
}

export function findCountryProfileById(id: number): CountryProfile | undefined {
  return ALL_COUNTRY_PROFILES.find((c) => c.id === id);
}
