import { CountryProfile } from "@/domain/map/countries/types";
import { asiaWestProfiles } from "@/domain/data/countries/asia-west";
import { asiaEastProfiles } from "@/domain/data/countries/asia-east";

export const asiaProfiles: CountryProfile[] = [
  ...asiaWestProfiles,
  ...asiaEastProfiles,
];
