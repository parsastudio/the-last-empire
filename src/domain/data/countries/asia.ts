import { CountryProfile } from "@/domain/data/countries/profile.type";
import { asiaWestProfiles } from "@/domain/data/countries/asia-west";
import { asiaEastProfiles } from "@/domain/data/countries/asia-east";

export const asiaProfiles: CountryProfile[] = [
  ...asiaWestProfiles,
  ...asiaEastProfiles,
];
