import { GridState } from "@/engine/combat/state/grid-state";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";
import { GameState } from "@/domain/game/game-state.schema";

export class GameStateInitializer {
  private synchronizer = new StateSynchronizerFacade();

  public initializeSimulationForNation(
    nationId: string,
    gridState: GridState,
  ): GameState {
    const baseState: GameState = {
      gameId: `test6_game_${Date.now()}`,
      currentTurn: 1,
      seed: 554422,
      isGameOver: false,
      humanNationId: nationId,
      globalThreatLevel: 0,
      marketPrices: { oil: 100, steel: 100 },
      nations: {
        [nationId]: {
          id: nationId,
          name: nationId,
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
          resources: { oil: 1000, steel: 2000, manpower: 500 },
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
            territorySize: 9000,
            infrastructureLevel: 1,
            contiguousMainlandSize: 9000,
            isolatedPockets: [],
            coordinates: [],
          },
          relations: {},
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
      },
      provinces: {},
      turnLogs: [],
      eventFlags: {},
    };

    return this.synchronizer.synchronizeAll(baseState, gridState);
  }
}
