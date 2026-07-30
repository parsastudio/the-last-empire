import { CountryProfile } from "@/domain/map/countries/types";
import { africaProfiles } from "./africa";
import { americasProfiles } from "./americas";
import { asiaProfiles } from "./asia";
import { europeProfiles } from "./europe";
import { oceaniaProfiles } from "./oceania";
import { COUNTRY_ID_MAP } from "./id-mapping.config";

export type { CountryProfile };

const rawProfiles: CountryProfile[] = [
  ...africaProfiles,
  ...americasProfiles,
  ...asiaProfiles,
  ...europeProfiles,
  ...oceaniaProfiles,
];

export const ALL_COUNTRY_PROFILES: CountryProfile[] = rawProfiles.map(
  (profile) => ({
    ...profile,
    id: COUNTRY_ID_MAP[profile.code] ?? 0,
  }),
);

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
    const num = typeof id === "number" ? id : parseInt(id.toString(), 10);
    return ALL_COUNTRY_PROFILES.find((p) => p.id === num);
  }
  return findCountryProfileByCode(id.toString());
}
