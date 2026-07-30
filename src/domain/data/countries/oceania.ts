import { CountryProfile } from "@/domain/map/countries/types";

export const oceaniaProfiles: CountryProfile[] = [
  {
    code: "NZL",
    nameEn: "New Zealand",
    nameFa: "نیوزیلند",
    gdp: 250000000000,
    population: 5200000,
    traits: ["ISLAND_FORTRESS"],
    flagCode: "NZ",
    startingInfantry: 30,
    startingAirForce: 15,
    startingDroneMissile: 2,
    startingTechLevel: 4,
    startingGovernment: "DEMOCRACY",
  },
  {
    code: "AUS",
    nameEn: "Australia",
    nameFa: "استرالیا",
    gdp: 1700000000000,
    population: 26000000,
    traits: ["ISLAND_FORTRESS", "INDUSTRIAL_HUB"],
    flagCode: "AU",
    startingInfantry: 120,
    startingAirForce: 50,
    startingDroneMissile: 15,
    startingTechLevel: 4,
    startingGovernment: "DEMOCRACY",
  },
];
