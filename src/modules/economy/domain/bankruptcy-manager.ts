import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class BankruptcyManager {
  private readonly debtToGdpLimitRatio = 2.5;

  public isBankrupt(nation: Nation): boolean {
    if (nation.gdp <= 0) {
      return nation.nationalDebt > 0;
    }
    return nation.nationalDebt / nation.gdp >= this.debtToGdpLimitRatio;
  }

  public applyBankruptcy(nation: Nation): Nation {
    return {
      ...nation,
      treasury: 0,
      nationalDebt: Math.floor(nation.gdp * 0.5),
      government: {
        ...nation.government,
        stability: 0,
      },
      military: {
        ...nation.military,
        infantry: Math.floor(nation.military.infantry * 0.2),
        airForce: Math.floor(nation.military.airForce * 0.1),
        navy: Math.floor(nation.military.navy * 0.1),
        droneMissile: 0,
      },
      recruitmentQueue: [],
    };
  }

  public applyDisintegration(nation: Nation): Nation {
    const territoryLoss = Math.floor(nation.geography.territorySize * 0.25);
    const popLoss = Math.floor(nation.population * 0.2);
    return {
      ...nation,
      geography: {
        ...nation.geography,
        territorySize: Math.max(
          10,
          nation.geography.territorySize - territoryLoss,
        ),
      },
      population: Math.max(10000, nation.population - popLoss),
      consecutiveDeficitTurns: 0,
    };
  }
}
