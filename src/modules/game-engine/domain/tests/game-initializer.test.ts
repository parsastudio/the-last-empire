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
      resources: { money: 100, oil: 10, steel: 10, manpower: 100 },
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
      resources: { money: 100, oil: 10, steel: 10, manpower: 100 },
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: true,
        territorySize: 100,
        infrastructureLevel: 1,
      },
    } as unknown as Nation,
  };
  const initialized = initializer.assignDeterministicTraits(mockNations, prng);
  const identityDataValid =
    initialized.USA.gdp === 20000000 &&
    initialized.SAU.geography.territorySize === 5000;
  return identityDataValid;
}
