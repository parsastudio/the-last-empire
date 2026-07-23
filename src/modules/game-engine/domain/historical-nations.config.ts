import type { NationTrait } from "@/modules/nation/schemas/nation.schema";

export interface HistoricalNationData {
  name: string;
  flagCode: string;
  gdp: number;
  population: number;
  territorySize: number;
  traits: NationTrait[];
}

export const HISTORICAL_NATIONS_MAP: Record<string, HistoricalNationData> = {
  USA: {
    name: "United States of America",
    flagCode: "US",
    gdp: 25000000,
    population: 330000000,
    territorySize: 9800,
    traits: ["INDUSTRIAL_HUB", "MILITARISTIC"],
  },
  SAU: {
    name: "Saudi Arabia",
    flagCode: "SA",
    gdp: 800000,
    population: 35000000,
    territorySize: 2150,
    traits: ["OIL_RICH"],
  },
  DEU: {
    name: "Germany",
    flagCode: "DE",
    gdp: 4200000,
    population: 83000000,
    territorySize: 357,
    traits: ["INDUSTRIAL_HUB"],
  },
  IRN: {
    name: "Iran",
    flagCode: "IR",
    gdp: 450000,
    population: 85000000,
    territorySize: 1648,
    traits: ["OIL_RICH", "MILITARISTIC"],
  },
  RUS: {
    name: "Russia",
    flagCode: "RU",
    gdp: 1700000,
    population: 144000000,
    territorySize: 17098,
    traits: ["OIL_RICH", "MILITARISTIC"],
  },
};
