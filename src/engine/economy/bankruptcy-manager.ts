import { Nation, ActiveModifier } from "@/domain/nation/nation.schema";

export class BankruptcyManager {
  private readonly debtToGdpLimitRatio = 2.5;

  public hasReachedDebtLimit(nation: Nation): boolean {
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

  public isBankrupt(nation: Nation): boolean {
    return this.hasReachedDebtLimit(nation);
  }

  public applyBankruptcy(nation: Nation): Nation {
    const existingModifiers = nation.activeModifiers.filter(
      (m) =>
        m.id !== "bankruptcy-structural-decay" &&
        m.id !== "bankruptcy-debt-holiday" &&
        m.id !== "bankruptcy-bad-credit",
    );

    const newModifiers: ActiveModifier[] = [
      ...existingModifiers,
      {
        id: "bankruptcy-structural-decay",
        name: "Bankruptcy Economic Decay",
        effectType: "GDP_GROWTH_MULT",
        magnitude: -0.15,
        turnsRemaining: 10,
      },
      {
        id: "bankruptcy-debt-holiday",
        name: "Debt Restructuring Period",
        effectType: "BANKRUPTCY_HOLIDAY",
        magnitude: 0,
        turnsRemaining: 15,
      },
      {
        id: "bankruptcy-bad-credit",
        name: "Ruined Credit Rating",
        effectType: "CREDIT_RATING_MULT",
        magnitude: -80,
        turnsRemaining: 20,
      },
    ];

    return {
      ...nation,
      gdp: Math.floor(nation.gdp * 0.9),
      treasury: 0,
      nationalDebt: Math.floor(nation.nationalDebt * 0.8),
      industrialLevel: Math.max(1, nation.industrialLevel - 1),
      geography: {
        ...nation.geography,
        infrastructureLevel: Math.max(
          1,
          nation.geography.infrastructureLevel - 1,
        ),
      },
      government: {
        ...nation.government,
        stability: Math.max(10, nation.government.stability - 15),
      },
      military: {
        ...nation.military,
        techLevel: Math.max(1, nation.military.techLevel - 1),
        infantry: Math.floor(nation.military.infantry * 0.8),
        airForce: Math.floor(nation.military.airForce * 0.8),
      },
      activeModifiers: newModifiers,
    };
  }

  public applyDisintegration(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): { updatedNation: Nation; updatedAllNations: Record<string, Nation> } {
    const territoryLoss = Math.floor(nation.geography.territorySize * 0.25);
    const popLoss = Math.floor(nation.population * 0.2);

    const updatedNation = {
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

    return { updatedNation, updatedAllNations: allNations };
  }
}
