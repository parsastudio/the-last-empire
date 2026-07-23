import type {
  Nation,
  ActiveModifier,
} from "@/domain/nation/nation.schema";

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
    const debtRatio = nation.gdp > 0 ? nation.nationalDebt / nation.gdp : 1;

    const decayModifier: ActiveModifier = {
      id: "bankruptcy-structural-decay",
      name: "Bankruptcy Economic Decay",
      effectType: "GDP_GROWTH_MULT",
      magnitude: -0.25,
      turnsRemaining: 9999,
    };

    const restructuringHoliday: ActiveModifier = {
      id: "bankruptcy-debt-holiday",
      name: "Debt Restructuring Period",
      effectType: "BANKRUPTCY_HOLIDAY",
      magnitude: 0,
      turnsRemaining: 15,
    };

    const badCreditModifier: ActiveModifier = {
      id: "bankruptcy-bad-credit",
      name: "Ruined Credit Rating",
      effectType: "CREDIT_RATING_MULT",
      magnitude: -95,
      turnsRemaining: 40,
    };

    const existingModifiers = nation.activeModifiers.filter(
      (m) =>
        m.id !== "bankruptcy-structural-decay" &&
        m.id !== "bankruptcy-debt-holiday" &&
        m.id !== "bankruptcy-bad-credit",
    );

    const restructuredDebt = Math.floor(nation.nationalDebt * 0.8);
    const finalGdp = Math.floor(nation.gdp * 0.5);
    const excessiveDebtPenalty = debtRatio > 3.0 ? 3 : 1;

    return {
      ...nation,
      gdp: finalGdp,
      treasury: 0,
      nationalDebt: restructuredDebt,
      industrialLevel: Math.max(
        1,
        nation.industrialLevel - excessiveDebtPenalty,
      ),
      geography: {
        ...nation.geography,
        infrastructureLevel: Math.max(
          1,
          nation.geography.infrastructureLevel - excessiveDebtPenalty,
        ),
      },
      government: {
        ...nation.government,
        stability: 0,
      },
      military: {
        ...nation.military,
        techLevel: Math.max(1, nation.military.techLevel - 2),
        infantry: Math.floor(nation.military.infantry * 0.1),
        airForce: Math.floor(nation.military.airForce * 0.05),
        droneMissile: 0,
      },
      doctrines: {
        doctrinePoints: 0,
        unlockedDoctrines: [],
      },
      resources: {
        ...nation.resources,
        oil: Math.floor(nation.resources.oil * 0.05),
        steel: Math.floor(nation.resources.steel * 0.05),
        manpower: Math.floor(nation.resources.manpower * 0.05),
      },
      recruitmentQueue: [],
      activeModifiers: [
        ...existingModifiers,
        decayModifier,
        restructuringHoliday,
        badCreditModifier,
      ],
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

    const updatedAllNations = { ...allNations };
    const aliveLandNeighbors = nation.geography.landNeighbors.filter(
      (id) => allNations[id] && allNations[id].isAlive,
    );

    if (aliveLandNeighbors.length > 0) {
      const refugeesPerNeighbor = Math.floor(
        (popLoss * 0.05) / aliveLandNeighbors.length,
      );

      for (const neighborId of aliveLandNeighbors) {
        const neighbor = updatedAllNations[neighborId];
        if (neighbor) {
          updatedAllNations[neighborId] = {
            ...neighbor,
            population: neighbor.population + refugeesPerNeighbor,
            government: {
              ...neighbor.government,
              stability: Math.max(10, neighbor.government.stability - 15),
              corruption: Math.min(100, neighbor.government.corruption + 10),
            },
          };
        }
      }
    }

    return { updatedNation, updatedAllNations };
  }
}
