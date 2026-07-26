import { CountryProfile } from "./types";
import { africaProfiles } from "./africa";
import { americasProfiles } from "./americas";
import { asiaProfiles } from "./asia";
import { europeProfiles } from "./europe";
import { oceaniaProfiles } from "./oceania";

export * from "./types";

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
  return ALL_COUNTRY_PROFILES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase(),
  );
}

export function findCountryProfileById(id: number): CountryProfile | undefined {
  return ALL_COUNTRY_PROFILES.find((c) => c.id === id);
}
