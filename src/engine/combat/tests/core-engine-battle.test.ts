import { GameState } from "@/domain/game/game-state.schema";
import { GameEngine } from "@/engine/game-engine";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { GameAction } from "@/domain/game/action.schema";

export function runCoreEngineBattleTest(): boolean {
  const mockGridState = new GridState();
  const cell: GridCell = {
    x: 10,
    y: 10,
    ownerId: "USA",
    isOccupied: false,
    occupierId: null,
    highResPixelCount: 16,
    enclaveId: 0,
  };
  mockGridState.setCell(10, 10, cell);

  const mockState = {
    gameId: "ENGINE_TEST_GAME",
    currentTurn: 1,
    seed: 999,
    isGameOver: false,
    humanNationId: "IRN",
    globalThreatLevel: 0,
    turnLogs: [],
    eventFlags: {},
    nations: {
      IRN: {
        id: "IRN",
        isAi: false,
        isAlive: true,
        gdp: 100,
        population: 100,
        treasury: 100000,
        nationalDebt: 0,
        relations: {},
        activeModifiers: [],
        traits: [],
        government: {
          type: "DEMOCRACY",
          stability: 80,
          corruption: 5,
          turnsInPower: 5,
        },
        resources: { oil: 100, steel: 100, manpower: 100 },
        upkeep: {
          infantryUpkeep: 1,
          airForceUpkeep: 1,
          droneMissileUpkeep: 1,
          infrastructureUpkeep: 1,
        },
        military: {
          infantry: 100,
          airForce: 20,
          droneMissile: 5,
          experience: 10,
          techLevel: 1,
          mobility: 1,
        },
        recruitmentQueue: [],
        geography: {
          landNeighbors: [],
          seaNeighbors: [],
          hasSeaAccess: true,
          territorySize: 100,
          infrastructureLevel: 1,
          contiguousMainlandSize: 100,
          isolatedPockets: [],
        },
        doctrines: { doctrinePoints: 0, unlockedDoctrines: [] },
        proxyInfluenceBudget: {},
      },
      USA: {
        id: "USA",
        isAi: true,
        isAlive: true,
        gdp: 100,
        population: 100,
        treasury: 100000,
        nationalDebt: 0,
        relations: {},
        activeModifiers: [],
        traits: [],
        government: {
          type: "DEMOCRACY",
          stability: 80,
          corruption: 5,
          turnsInPower: 5,
        },
        resources: { oil: 100, steel: 100, manpower: 100 },
        upkeep: {
          infantryUpkeep: 1,
          airForceUpkeep: 1,
          droneMissileUpkeep: 1,
          infrastructureUpkeep: 1,
        },
        military: {
          infantry: 100,
          airForce: 20,
          droneMissile: 5,
          experience: 10,
          techLevel: 1,
          mobility: 1,
        },
        recruitmentQueue: [],
        geography: {
          landNeighbors: [],
          seaNeighbors: [],
          hasSeaAccess: true,
          territorySize: 100,
          infrastructureLevel: 1,
          contiguousMainlandSize: 100,
          isolatedPockets: [],
        },
        doctrines: { doctrinePoints: 0, unlockedDoctrines: [] },
        proxyInfluenceBudget: {},
      },
    },
    provinces: {},
    gridState: mockGridState,
  } as unknown as GameState;

  const engine = new GameEngine(mockState);

  const attackAction: GameAction = {
    id: "attack-action-1",
    nationId: "IRN",
    type: "ATTACK",
    targetNationId: "USA",
    infantry: 10,
    airForce: 10,
    droneMissile: 0,
  };

  const result = engine.dispatchAction(attackAction);
  return result.success;
}
