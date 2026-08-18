import { CountryProfile } from "@/domain/data/countries/profile.type";
import {
  ALL_COUNTRY_PROFILES,
  CountryRegistry,
} from "@/domain/data/countries/country-registry";

export type { CountryProfile };
export { ALL_COUNTRY_PROFILES, CountryRegistry };

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
