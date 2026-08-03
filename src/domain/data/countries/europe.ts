import { CountryProfile } from "@/domain/map/countries/types";
import { europeWestProfiles } from "@/domain/data/countries/europe-west";
import { europeEastProfiles } from "@/domain/data/countries/europe-east";

export const europeProfiles: CountryProfile[] = [
  ...europeWestProfiles,
  ...europeEastProfiles,
];
