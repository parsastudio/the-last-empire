import { CountryProfile } from "@/domain/data/countries/profile.type";
import { europeWestProfiles } from "@/domain/data/countries/europe-west";
import { europeEastProfiles } from "@/domain/data/countries/europe-east";

export const europeProfiles: CountryProfile[] = [
  ...europeWestProfiles,
  ...europeEastProfiles,
];
