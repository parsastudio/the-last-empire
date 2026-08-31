import { CountryProfile } from "@/domain/data/countries/profile.type";
import {
  ALL_COUNTRY_PROFILES,
  CountryRegistry,
} from "@/domain/data/countries/country-registry";
import { CountryDefaultsUtility } from "@/domain/data/countries/country-defaults.utility";
import { ManifestValidator } from "@/domain/data/countries/manifest-validator";
import { COUNTRY_IDENTITY_MAP } from "@/domain/data/countries/sources/country-identity.data";
import { COUNTRY_DEMOGRAPHICS_MAP } from "@/domain/data/countries/sources/country-demographics.data";
import { COUNTRY_GDP_MAP } from "@/domain/data/countries/sources/country-economy.data";
import { COUNTRY_MILITARY_MAP } from "@/domain/data/countries/sources/country-military.data";
import { COUNTRY_INDUSTRY_MAP } from "@/domain/data/countries/sources/country-industry.data";

export type { CountryProfile };
export {
  ALL_COUNTRY_PROFILES,
  CountryRegistry,
  CountryDefaultsUtility,
  ManifestValidator,
  COUNTRY_IDENTITY_MAP,
  COUNTRY_DEMOGRAPHICS_MAP,
  COUNTRY_GDP_MAP,
  COUNTRY_MILITARY_MAP,
  COUNTRY_INDUSTRY_MAP,
};
