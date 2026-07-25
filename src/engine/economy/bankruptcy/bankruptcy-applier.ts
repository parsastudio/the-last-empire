import { Nation, ActiveModifier } from "@/domain/nation/nation.schema";

export class BankruptcyApplier {
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
}
