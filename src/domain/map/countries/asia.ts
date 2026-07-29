import { CountryProfile } from "./types";
import { centralAsiaProfiles } from "./asia/central-asia";
import { middleEastProfiles } from "./asia/middle-east";
import { eastAsiaProfiles } from "./asia/east-asia";
import { southAsiaProfiles } from "./asia/south-asia";
import { southeastAsiaProfiles } from "./asia/southeast-asia";

export const asiaProfiles: CountryProfile[] = [
  ...centralAsiaProfiles,
  ...middleEastProfiles,
  ...eastAsiaProfiles,
  ...southAsiaProfiles,
  ...southeastAsiaProfiles,
];
