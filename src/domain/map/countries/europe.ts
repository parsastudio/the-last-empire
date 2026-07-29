import { CountryProfile } from "./types";
import { easternEuropeProfiles } from "./europe/eastern-europe";
import { westernEuropeProfiles } from "./europe/western-europe";
import { northernEuropeProfiles } from "./europe/northern-europe";
import { southernEuropeProfiles } from "./europe/southern-europe";

export const europeProfiles: CountryProfile[] = [
  ...easternEuropeProfiles,
  ...westernEuropeProfiles,
  ...northernEuropeProfiles,
  ...southernEuropeProfiles,
];
