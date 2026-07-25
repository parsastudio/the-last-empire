import { Nation } from "@/domain/nation/nation.schema";

export class NationProfileAssigner {
  public buildStartingNation(id: string, isHuman: boolean): Nation {
    const isTier1 = id.endsWith("11") || id.endsWith("12") || id.endsWith("13");
    const isTier2 =
      id.endsWith("14") ||
      id.endsWith("15") ||
      id.endsWith("16") ||
      id.endsWith("17");

    const gdp = isTier1 ? 25000000 : isTier2 ? 10000000 : 5000000;
    const population = isTier1 ? 300000000 : isTier2 ? 150000000 : 80000000;
    const treasury = isTier1 ? 500000 : isTier2 ? 300000 : 100000;
    const traits = isTier1
      ? ["INDUSTRIAL_HUB" as const, "MILITARISTIC" as const]
      : isTier2
        ? ["OIL_RICH" as const]
        : ["FRAGILE_ECONOMY" as const];

    return {
      id,
      name: `Sovereign ${id.replace("NATION_", "Territory ")}`,
      isAi: !isHuman,
      isAlive: true,
      flagCode: "US",
      gdp,
      taxRate: 15,
      tariffRate: 10,
      treasury,
      nationalDebt: isTier1 ? 50000 : 0,
      population,
      warExhaustion: 0,
      industrialLevel: 1,
      adminBurdenMultiplier: 1.0,
      consecutiveDeficitTurns: 0,
      government: {
        type: "DEMOCRACY" as const,
        stability: 80,
        corruption: 5,
        socialFreedom: 80,
        turnsInPower: 5,
      },
      resources: {
        oil: isTier2 ? 5000 : 1000,
        steel: isTier1 ? 2000 : 1000,
        manpower: 500,
      },
      upkeep: {
        infantryUpkeep: 1,
        airForceUpkeep: 1,
        droneMissileUpkeep: 1,
        infrastructureUpkeep: 1,
      },
      military: {
        infantry: isTier1 ? 100 : 40,
        airForce: isTier1 ? 20 : 5,
        droneMissile: isTier1 ? 5 : 0,
        experience: 10,
        techLevel: 1,
        mobility: 1,
      },
      recruitmentQueue: [],
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: true,
        territorySize: isTier1 ? 9000 : 5000,
        infrastructureLevel: 1,
        contiguousMainlandSize: isTier1 ? 9000 : 5000,
        isolatedPockets: [],
        coordinates: [],
      },
      relations: {},
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
  }
}
