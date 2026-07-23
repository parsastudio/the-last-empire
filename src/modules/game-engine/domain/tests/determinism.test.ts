import { GameEngine } from "../game-engine";
import { calculateStateHash } from "@/core/utils/state-hash";
import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";

export function runDeterminismTest(): boolean {
  const initialPrices = { oil: 100, steel: 100 };

  const mockState: GameState = {
    gameId: "DETERMINISM_TEST_GAME",
    currentTurn: 1,
    seed: 554422,
    isGameOver: false,
    humanNationId: "USA",
    globalThreatLevel: 0,
    marketPrices: initialPrices,
    turnLogs: [],
    eventFlags: {},
    nations: {
      USA: {
        id: "USA",
        name: "United States of America",
        isAi: false,
        isAlive: true,
        flagCode: "US",
        gdp: 25000000,
        taxRate: 15,
        tariffRate: 10,
        treasury: 100000,
        debt: 0,
        population: 330000000,
        inflation: 2.0,
        warExhaustion: 0,
        reputation: 50,
        industrialLevel: 1,
        government: {
          type: "DEMOCRACY",
          stability: 80,
          corruption: 5,
          socialFreedom: 80,
          turnsInPower: 5,
        },
        resources: { money: 100000, oil: 50, steel: 50, manpower: 500 },
        upkeep: {
          infantryUpkeep: 1,
          airForceUpkeep: 1,
          navyUpkeep: 1,
          droneMissileUpkeep: 1,
          infrastructureUpkeep: 1,
        },
        military: {
          infantry: 100,
          airForce: 20,
          navy: 10,
          droneMissile: 5,
          experience: 10,
          techLevel: 1,
          mobility: 1,
        },
        recruitmentQueue: [],
        geography: {
          landNeighbors: ["CAN"],
          seaNeighbors: [],
          hasSeaAccess: true,
          territorySize: 9800,
          infrastructureLevel: 1,
        },
        relations: {
          CAN: {
            targetNationId: "CAN",
            stance: "PEACE",
            opinion: 50,
            tributePerTurn: 0,
            militaryAccess: false,
            embargoActive: false,
            treatyTurnsRemaining: 0,
            spyNetworkStrength: 0,
            intelLevel: 1,
            trust: 0,
            tension: 0,
          },
        },
        activeModifiers: [],
        imfLoans: [],
        traits: ["INDUSTRIAL_HUB", "MILITARISTIC"],
        aggressionScore: 0,
      },
      CAN: {
        id: "CAN",
        name: "Canada",
        isAi: true,
        isAlive: true,
        flagCode: "CA",
        gdp: 2000000,
        taxRate: 15,
        tariffRate: 10,
        treasury: 50000,
        debt: 0,
        population: 38000000,
        inflation: 1.5,
        warExhaustion: 0,
        reputation: 60,
        industrialLevel: 1,
        government: {
          type: "DEMOCRACY",
          stability: 85,
          corruption: 2,
          socialFreedom: 85,
          turnsInPower: 4,
        },
        resources: { money: 50000, oil: 10, steel: 10, manpower: 100 },
        upkeep: {
          infantryUpkeep: 1,
          airForceUpkeep: 1,
          navyUpkeep: 1,
          droneMissileUpkeep: 1,
          infrastructureUpkeep: 1,
        },
        military: {
          infantry: 20,
          airForce: 5,
          navy: 2,
          droneMissile: 1,
          experience: 5,
          techLevel: 1,
          mobility: 1,
        },
        recruitmentQueue: [],
        geography: {
          landNeighbors: ["USA"],
          seaNeighbors: [],
          hasSeaAccess: true,
          territorySize: 9980,
          infrastructureLevel: 1,
        },
        relations: {
          USA: {
            targetNationId: "USA",
            stance: "PEACE",
            opinion: 50,
            tributePerTurn: 0,
            militaryAccess: false,
            embargoActive: false,
            treatyTurnsRemaining: 0,
            spyNetworkStrength: 0,
            intelLevel: 1,
            trust: 0,
            tension: 0,
          },
        },
        activeModifiers: [],
        imfLoans: [],
        traits: [],
        aggressionScore: 0,
      },
    },
  };

  const action: GameAction = {
    id: "action-1",
    nationId: "USA",
    type: "TRADE_RESOURCES",
    resourceType: "oil",
    isBuy: true,
    amount: 10,
  };

  const engineA = new GameEngine(mockState);
  const engineB = new GameEngine(mockState);

  engineA.dispatchAction(action);
  engineB.dispatchAction(action);

  const stateA = engineA.nextTurn();
  const stateB = engineB.nextTurn();

  const hashA = calculateStateHash(stateA);
  const hashB = calculateStateHash(stateB);

  return hashA === hashB;
}
