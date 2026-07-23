import type {
  Nation,
  ActiveModifier,
} from "@/modules/nation/schemas/nation.schema";

export class BankruptcyManager {
  private readonly debtToGdpLimitRatio = 2.5;

  public isBankrupt(nation: Nation): boolean {
    if (
      nation.activeModifiers.some((m) => m.id === "bankruptcy-debt-holiday")
    ) {
      return false;
    }
    if (nation.gdp <= 0) {
      return nation.nationalDebt > 0;
    }
    return nation.nationalDebt / nation.gdp >= this.debtToGdpLimitRatio;
  }

  public applyBankruptcy(nation: Nation): Nation {
    const decayModifier: ActiveModifier = {
      id: "bankruptcy-structural-decay",
      name: "Bankruptcy Economic Decay",
      effectType: "GDP_GROWTH_MULT",
      magnitude: -0.15,
      turnsRemaining: 9999,
    };

    const restructuringHoliday: ActiveModifier = {
      id: "bankruptcy-debt-holiday",
      name: "Debt Restructuring Period",
      effectType: "BANKRUPTCY_HOLIDAY",
      magnitude: 0,
      turnsRemaining: 10,
    };

    const existingModifiers = nation.activeModifiers.filter(
      (m) =>
        m.id !== "bankruptcy-structural-decay" &&
        m.id !== "bankruptcy-debt-holiday",
    );

    const restructuredDebt = Math.min(
      Math.floor(nation.nationalDebt * 0.5),
      Math.floor(nation.gdp * 1.2),
    );

    return {
      ...nation,
      treasury: 0,
      nationalDebt: restructuredDebt,
      industrialLevel: Math.max(1, nation.industrialLevel - 2),
      government: {
        ...nation.government,
        stability: 0,
      },
      military: {
        ...nation.military,
        infantry: Math.floor(nation.military.infantry * 0.2),
        airForce: Math.floor(nation.military.airForce * 0.1),
        droneMissile: 0,
      },
      recruitmentQueue: [],
      activeModifiers: [
        ...existingModifiers,
        decayModifier,
        restructuringHoliday,
      ],
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
