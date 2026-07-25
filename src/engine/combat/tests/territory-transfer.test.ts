import { TerritoryOccupationManager } from "@/engine/combat/territory-occupation-manager";
import type { Nation } from "@/domain/nation/nation.schema";
import type { Province } from "@/domain/map/province.schema";

export function runTerritoryTransferTest(): boolean {
  const manager = new TerritoryOccupationManager();

  const mockWinner = {
    id: "NATION_A",
    name: "Nation A",
    treasury: 10000,
    geography: {
      territorySize: 1000,
      contiguousMainlandSize: 1000,
      isolatedPockets: [],
      infrastructureLevel: 2,
      landNeighbors: [],
      seaNeighbors: [],
      hasSeaAccess: true,
    },
    government: {
      type: "DEMOCRACY",
      stability: 80,
      corruption: 10,
      turnsInPower: 5,
    },
  } as unknown as Nation;

  const mockLoser = {
    id: "NATION_B",
    name: "Nation B",
    treasury: 5000,
    geography: {
      territorySize: 800,
      contiguousMainlandSize: 800,
      isolatedPockets: [],
      infrastructureLevel: 1,
      landNeighbors: [],
      seaNeighbors: [],
      hasSeaAccess: false,
    },
    government: {
      type: "DICTATORSHIP",
      stability: 40,
      corruption: 30,
      turnsInPower: 12,
    },
  } as unknown as Nation;

  const mockProvinces: Record<string, Province> = {
    NATION_B_P1: {
      id: "NATION_B_P1",
      name: "Region B",
      ownerNationId: "NATION_B",
      gdp: 5000,
      population: 100000,
      isCapital: true,
      territorySize: 800,
      x: 0,
      y: 0,
      isCoastal: false,
      isOccupied: false,
      neighbors: [],
    },
  };

  const result = manager.processVictoryOccupation(
    mockWinner,
    mockLoser,
    mockProvinces,
    0.25,
  );

  const winnerValid =
    result.winner.geography.territorySize === 1200 &&
    result.winner.treasury === 11250;

  const loserValid =
    result.loser.geography.territorySize === 600 &&
    result.loser.treasury === 3750 &&
    result.loser.government.stability === 20;

  return winnerValid && loserValid;
}
