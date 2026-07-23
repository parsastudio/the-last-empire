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
        gdp: 20000000,
        taxRate: 15,
        tariffRate: 10,
        treasury: 500000,
        nationalDebt: 50000,
        population: 300000000,
        warExhaustion: 0,
        reputation: 50,
        industrialLevel: 1,
        adminBurdenMultiplier: 1.0,
        consecutiveDeficitTurns: 0,
        government: {
          type: "DEMOCRACY",
          stability: 80,
          corruption: 5,
          socialFreedom: 80,
          turnsInPower: 5,
        },
        resources: { money: 500000, oil: 1000, steel: 2000, manpower: 500 },
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
          territorySize: 9000,
          infrastructureLevel: 1,
          contiguousMainlandSize: 9000,
          isolatedPockets: [],
        },
        relations: {
          CAN: {
            targetNationId: "CAN",
            stance: "PEACE",
            opinion: 50,
            tributePerTurn: 0,
            militaryAccess: false,
            coolOffTurnsRemaining: 0,
            intelLevel: 1,
          },
        },
        activeModifiers: [],
        traits: ["INDUSTRIAL_HUB", "MILITARISTIC"],
        globalReputation: 50,
        globalAggression: 0,
        doctrines: {
          doctrinePoints: 0,
          unlockedDoctrines: [],
        },
        proxyInfluenceBudget: {},
      },
      CAN: {
        id: "CAN",
        name: "Canada",
        isAi: true,
        isAlive: true,
        flagCode: "CA",
        gdp: 10000000,
        taxRate: 15,
        tariffRate: 10,
        treasury: 300000,
        nationalDebt: 0,
        population: 150000000,
        warExhaustion: 0,
        reputation: 60,
        industrialLevel: 1,
        adminBurdenMultiplier: 1.0,
        consecutiveDeficitTurns: 0,
        government: {
          type: "DEMOCRACY",
          stability: 85,
          corruption: 2,
          socialFreedom: 85,
          turnsInPower: 4,
        },
        resources: { money: 300000, oil: 5000, steel: 1000, manpower: 100 },
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
          territorySize: 5000,
          infrastructureLevel: 1,
          contiguousMainlandSize: 5000,
          isolatedPockets: [],
        },
        relations: {
          USA: {
            targetNationId: "USA",
            stance: "PEACE",
            opinion: 50,
            tributePerTurn: 0,
            militaryAccess: false,
            coolOffTurnsRemaining: 0,
            intelLevel: 1,
          },
        },
        activeModifiers: [],
        traits: ["OIL_RICH"],
        globalReputation: 60,
        globalAggression: 0,
        doctrines: {
          doctrinePoints: 0,
          unlockedDoctrines: [],
        },
        proxyInfluenceBudget: {},
      },
    },
  };
  const tradeAction: GameAction = {
    id: "action-1",
    nationId: "USA",
    type: "TRADE_RESOURCES",
    resourceType: "oil",
    isBuy: true,
    amount: 10,
  };
  const repayAction: GameAction = {
    id: "action-2",
    nationId: "USA",
    type: "REPAY_DEBT",
    amount: 10000,
  };
  const engineA = new GameEngine(mockState);
  const engineB = new GameEngine(mockState);
  engineA.dispatchAction(tradeAction);
  engineB.dispatchAction(tradeAction);
  engineA.dispatchAction(repayAction);
  engineB.dispatchAction(repayAction);
  const stateA = engineA.nextTurn();
  const stateB = engineB.nextTurn();
  const hashA = calculateStateHash(stateA);
  const hashB = calculateStateHash(stateB);
  return hashA === hashB;
}
