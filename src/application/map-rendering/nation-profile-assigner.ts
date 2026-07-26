import { Nation } from "@/domain/nation/nation.schema";
import { findCountryProfileById } from "@/domain/map/countries";

export class NationProfileAssigner {
  public buildStartingNation(id: string, isHuman: boolean): Nation {
    const numericId = parseInt(id.replace("NATION_", ""), 10);
    const profile = findCountryProfileById(numericId);

    const gdp = profile ? profile.gdp : 5000000000;
    const population = profile ? profile.population : 80000000;
    const treasury = profile ? profile.startingTreasury : 100000;
    const traits = profile ? profile.traits : ["FRAGILE_ECONOMY" as const];
    const name = profile
      ? `کشور ${profile.nameFa}`
      : `قلمرو مستقل ${numericId}`;
    const flagCode = profile ? profile.flagCode : "US";

    const isTier1 = profile ? profile.gdp >= 1000000000000 : false;
    const isTier2 = profile ? profile.traits.includes("OIL_RICH") : false;

    return {
      id,
      name,
      isAi: !isHuman,
      isAlive: true,
      flagCode,
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
        territorySize: 1000,
        infrastructureLevel: 1,
        contiguousMainlandSize: 1000,
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
