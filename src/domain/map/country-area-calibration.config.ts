import { ALL_COUNTRY_PROFILES } from "./countries";

export const REAL_WORLD_COUNTRY_AREAS: Record<string, number> = {};

for (const country of ALL_COUNTRY_PROFILES) {
  REAL_WORLD_COUNTRY_AREAS[country.code] = country.areaSqKm;
  REAL_WORLD_COUNTRY_AREAS[country.id.toString()] = country.areaSqKm;
  REAL_WORLD_COUNTRY_AREAS[`NATION_${country.id}`] = country.areaSqKm;
}
