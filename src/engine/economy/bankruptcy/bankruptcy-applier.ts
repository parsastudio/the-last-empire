import { Nation } from "@/domain/nation/nation.schema";
import {
  BANKRUPTCY_STRUCTURAL_DECAY,
  BANKRUPTCY_DEBT_HOLIDAY,
  BANKRUPTCY_BAD_CREDIT,
} from "./bankruptcy-modifiers.config";

export class BankruptcyApplier {
  public applyBankruptcy(nation: Nation): Nation {
    const debtRatio = nation.gdp > 0 ? nation.nationalDebt / nation.gdp : 1;

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
        { ...BANKRUPTCY_STRUCTURAL_DECAY },
        { ...BANKRUPTCY_DEBT_HOLIDAY },
        { ...BANKRUPTCY_BAD_CREDIT },
      ],
    };
  }
}
