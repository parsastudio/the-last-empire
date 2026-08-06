import { CountryProfile } from "@/domain/data/countries/profile.type";
import { africaProfiles } from "@/domain/data/countries/africa";
import { americasProfiles } from "@/domain/data/countries/americas";
import { asiaWestProfiles } from "@/domain/data/countries/asia-west";
import { asiaEastProfiles } from "@/domain/data/countries/asia-east";
import { europeWestProfiles } from "@/domain/data/countries/europe-west";
import { europeEastProfiles } from "@/domain/data/countries/europe-east";
import { oceaniaProfiles } from "@/domain/data/countries/oceania";
import { COUNTRY_ID_MAP } from "@/domain/data/countries/id-mapping.config";

export type { CountryProfile };

const rawProfiles: CountryProfile[] = [
  ...africaProfiles,
  ...americasProfiles,
  ...asiaWestProfiles,
  ...asiaEastProfiles,
  ...europeWestProfiles,
  ...europeEastProfiles,
  ...oceaniaProfiles,
];

export const ALL_COUNTRY_PROFILES: CountryProfile[] = rawProfiles.map(
  (profile) => ({
    ...profile,
    id: COUNTRY_ID_MAP[profile.code] ?? 0,
  }),
);

const codeMap = new Map<string, CountryProfile>();
const idMap = new Map<number, CountryProfile>();

for (const profile of ALL_COUNTRY_PROFILES) {
  codeMap.set(profile.code.toUpperCase(), profile);
  if (profile.flagCode) {
    codeMap.set(profile.flagCode.toUpperCase(), profile);
  }
  if (profile.id) {
    idMap.set(profile.id, profile);
  }
}

export function findCountryProfileByCode(
  code: string,
): CountryProfile | undefined {
  if (!code) return undefined;
  const clean = code.toUpperCase().replace("NATION_", "").trim();
  return codeMap.get(clean);
}

export function findCountryProfileById(
  id: number | string,
): CountryProfile | undefined {
  if (typeof id === "number") {
    return idMap.get(id);
  }
  if (!id) return undefined;

  const num = parseInt(id.toString(), 10);
  if (!isNaN(num)) {
    const found = idMap.get(num);
    if (found) return found;
  }

  return findCountryProfileByCode(id.toString());
}
