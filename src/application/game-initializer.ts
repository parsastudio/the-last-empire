import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/map/province.schema";
import { GridGenerator } from "@/engine/map/grid-generator";
import { expandCountryProvinces } from "@/application/province-engine";
import { HISTORICAL_NATIONS_MAP } from "@/application/historical-nations.config";
import type { GeoJsonData } from "@/engine/map/grid-generator";
import { SeededRandom } from "@/domain/shared/seeded-random";

export class GameInitializer {
  public initializeGame(
    geoJson: GeoJsonData,
    humanNationId: string,
    seed: number,
  ): GameState {
    const generator = new GridGenerator();
    const rawPayload = generator.generateVectorMap(geoJson, 1200, 600);
    const expandedProvinces = expandCountryProvinces(rawPayload.provinces);
    const prng = new SeededRandom(seed);

    const nations: Record<string, Nation> = {};
    const activeCountryCodes = Array.from(
      new Set(Object.values(expandedProvinces).map((p) => p.ownerNationId)),
    );

    activeCountryCodes.forEach((code) => {
      const historical = HISTORICAL_NATIONS_MAP[code];
      const codeProvs = Object.values(expandedProvinces).filter(
        (p) => p.ownerNationId === code,
      );
      const territorySize = codeProvs.reduce(
        (sum, p) => sum + p.territorySize,
        0,
      );

      const gdp = historical
        ? historical.gdp * 1000000
        : territorySize * 25000000;
      const population = historical
        ? historical.population
        : territorySize * 30000;
      const name = historical ? historical.name : `${code} Republic`;
      const flagCode = historical ? historical.flagCode : code.substring(0, 2);
      const traits = historical ? historical.traits : [];

      const subGdp = Math.floor(gdp / codeProvs.length);
      const subPop = Math.floor(population / codeProvs.length);
      codeProvs.forEach((p) => {
        p.gdp = subGdp;
        p.population = subPop;
      });

      const relations: Record<
        string,
        {
          targetNationId: string;
          stance: "PEACE" | "WAR" | "ALLIANCE" | "NON_AGGRESSION_PACT";
          opinion: number;
          tributePerTurn: number;
          militaryAccess: boolean;
          intelLevel: number;
          coolOffTurnsRemaining: number;
        }
      > = {};

      activeCountryCodes.forEach((otherCode) => {
        if (otherCode !== code) {
          relations[otherCode] = {
            targetNationId: otherCode,
            stance: "PEACE",
            opinion: 0,
            tributePerTurn: 0,
            militaryAccess: false,
            intelLevel: 0,
            coolOffTurnsRemaining: 0,
          };
        }
      });

      nations[code] = {
        id: code,
        name,
        isAi: code !== humanNationId,
        isAlive: true,
        flagCode,
        gdp,
        taxRate: 15,
        tariffRate: 10,
        treasury: 100000,
        nationalDebt: 0,
        population,
        warExhaustion: 0,
        industrialLevel: 1,
        adminBurdenMultiplier: 1.0,
        consecutiveDeficitTurns: 0,
        government: {
          type: "DEMOCRACY",
          stability: 70,
          corruption: 10,
          socialFreedom: 70,
          turnsInPower: 0,
        },
        resources: {
          oil: prng.nextInt(100, 500),
          steel: prng.nextInt(100, 500),
          manpower: Math.floor(population * 0.05),
        },
        upkeep: {
          infantryUpkeep: 10,
          airForceUpkeep: 50,
          droneMissileUpkeep: 20,
          infrastructureUpkeep: 5,
        },
        military: {
          infantry: prng.nextInt(30, 100),
          airForce: prng.nextInt(5, 20),
          droneMissile: prng.nextInt(0, 10),
          experience: 0,
          techLevel: 1,
          mobility: 1,
        },
        recruitmentQueue: [],
        geography: {
          landNeighbors: [],
          seaNeighbors: [],
          hasSeaAccess: true,
          territorySize,
          infrastructureLevel: 1,
          contiguousMainlandSize: territorySize,
          isolatedPockets: [],
          coordinates: [],
        },
        relations,
        activeModifiers: [],
        traits,
        globalReputation: 50,
        globalAggression: 0,
        doctrines: {
          doctrinePoints: 0,
          unlockedDoctrines: [],
        },
        proxyInfluenceBudget: {},
      };
    });

    activeCountryCodes.forEach((code) => {
      const nation = nations[code];
      if (nation) {
        const neighbors = new Set<string>();
        const codeProvs = Object.values(expandedProvinces).filter(
          (p) => p.ownerNationId === code,
        );
        codeProvs.forEach((p) => {
          p.neighbors.forEach((nId) => {
            const neighborProv = expandedProvinces[nId];
            if (neighborProv && neighborProv.ownerNationId !== code) {
              neighbors.add(neighborProv.ownerNationId);
            }
          });
        });
        nation.geography.landNeighbors = Array.from(neighbors);
      }
    });

    return {
      gameId: `procedural-game-${Date.now()}`,
      currentTurn: 1,
      seed,
      isGameOver: false,
      humanNationId,
      globalThreatLevel: 0,
      marketPrices: {
        oil: 100,
        steel: 100,
      },
      nations,
      provinces: expandedProvinces,
      turnLogs: [],
      eventFlags: {},
    };
  }
}
