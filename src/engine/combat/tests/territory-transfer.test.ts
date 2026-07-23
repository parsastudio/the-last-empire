import { TerritoryOccupationManager } from "../territory-occupation-manager";
import type { Nation } from "@/domain/nation/nation.schema";

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

  const result = manager.processVictoryOccupation(mockWinner, mockLoser, 0.25);

  const winnerValid =
    result.winner.geography.territorySize === 1200 &&
    result.winner.treasury === 11250;

  const loserValid =
    result.loser.geography.territorySize === 600 &&
    result.loser.treasury === 3750 &&
    result.loser.government.stability === 20;

  return winnerValid && loserValid;
}
