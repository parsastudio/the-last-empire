import { CountryProfile } from "./types";

export const oceaniaProfiles: CountryProfile[] = [
  {
    id: 34,
    code: "ATF",
    nameEn: "Fr. S. Antarctic Lands",
    nameFa: "سرزمین‌های قطب جنوب فرانسه",
    gdp: 100000000,
    population: 200,
    traits: ["ISLAND_FORTRESS", "ISOLATED_SOCIETY"],
    flagCode: "TF",
    startingTreasury: 50000,
  },
  {
    id: 147,
    code: "NZL",
    nameEn: "New Zealand",
    nameFa: "نیوزیلند",
    gdp: 250000000000,
    population: 5200000,
    traits: ["ISLAND_FORTRESS"],
    flagCode: "NZ",
    startingTreasury: 230000,
  },
  {
    id: 148,
    code: "AUS",
    nameEn: "Australia",
    nameFa: "استرالیا",
    gdp: 1700000000000,
    population: 26000000,
    traits: ["ISLAND_FORTRESS", "INDUSTRIAL_HUB"],
    flagCode: "AU",
    startingTreasury: 480000,
  },
];
