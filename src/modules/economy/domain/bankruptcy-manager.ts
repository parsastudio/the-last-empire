import type { Nation } from "@/core/types";

export class BankruptcyManager {
  private readonly debtToGdpLimitRatio = 2.5;

  public isBankrupt(nation: Nation): boolean {
    if (nation.gdp <= 0) {
      return nation.debt > 0;
    }
    return nation.debt / nation.gdp >= this.debtToGdpLimitRatio;
  }

  public applyBankruptcy(nation: Nation): Nation {
    return {
      ...nation,
      treasury: 0,
      debt: Math.floor(nation.gdp * 0.5),
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
}
