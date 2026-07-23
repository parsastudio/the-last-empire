import { GameInitializer } from "../game-initializer";
import { SeededRandom } from "@/core/math/seeded-random";
import type { Nation } from "@/modules/nation/schemas/nation.schema";

export function runGameInitializerTest(): boolean {
  const initializer = new GameInitializer();
  const prng = new SeededRandom(999);

  const mockNations: Record<string, Nation> = {
    USA: {
      id: "USA",
      name: "Generic US",
      gdp: 100,
      population: 100,
      traits: [],
      flagCode: "X",
      relations: {},
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: true,
        territorySize: 100,
        infrastructureLevel: 1,
      },
    } as unknown as Nation,
    SAU: {
      id: "SAU",
      name: "Generic SA",
      gdp: 100,
      population: 100,
      traits: [],
      flagCode: "X",
      relations: {},
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: true,
        territorySize: 100,
        infrastructureLevel: 1,
      },
    } as unknown as Nation,
    ABC: {
      id: "ABC",
      name: "Minor Nation",
      gdp: 50,
      population: 50,
      traits: [],
      flagCode: "Z",
      relations: {},
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: false,
        territorySize: 50,
        infrastructureLevel: 1,
      },
    } as unknown as Nation,
  };

  const initialized = initializer.assignDeterministicTraits(mockNations, prng);

  const usaValid =
    initialized.USA.traits.includes("INDUSTRIAL_HUB") &&
    initialized.USA.traits.includes("MILITARISTIC");
  const sauValid = initialized.SAU.traits.includes("OIL_RICH");
  const abcValid = initialized.ABC.traits.length > 0;

  const identityDataValid =
    initialized.USA.gdp === 25000000 &&
    initialized.SAU.geography.territorySize === 2150;

  return usaValid && sauValid && abcValid && identityDataValid;
}
