import { CountryProfile } from "@/domain/data/countries/profile.type";
import {
  ALL_COUNTRY_PROFILES,
  CountryRegistry,
} from "@/domain/data/countries/country-registry";
import { CountryDefaultsUtility } from "@/domain/data/countries/country-defaults.utility";

export type { CountryProfile };
export { ALL_COUNTRY_PROFILES, CountryRegistry, CountryDefaultsUtility };

export function findCountryProfileByCode(
  code: string,
): CountryProfile | undefined {
  return CountryRegistry.getCountry(code);
}

export function findCountryProfileById(
  id: number | string,
): CountryProfile | undefined {
  return CountryRegistry.getCountry(id);
}
