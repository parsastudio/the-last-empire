import { Nation } from "@/domain/nation/nation.schema";
import {
  BANKRUPTCY_STRUCTURAL_DECAY,
  BANKRUPTCY_DEBT_HOLIDAY,
  BANKRUPTCY_BAD_CREDIT,
} from "./bankruptcy-modifiers.config";

export class BankruptcyApplier {
  public applyBankruptcy(nation: Nation): Nation {
    const existingModifiers = nation.activeModifiers.filter(
      (m) =>
        m.id !== "bankruptcy-structural-decay" &&
        m.id !== "bankruptcy-debt-holiday" &&
        m.id !== "bankruptcy-bad-credit",
    );

    const restructuredDebt = Math.floor(nation.nationalDebt * 0.8);
    const adjustedGdp = Math.floor(nation.gdp * 0.9);

    return {
      ...nation,
      gdp: adjustedGdp,
      treasury: 0,
      nationalDebt: restructuredDebt,
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
      activeModifiers: [
        ...existingModifiers,
        { ...BANKRUPTCY_STRUCTURAL_DECAY },
        { ...BANKRUPTCY_DEBT_HOLIDAY },
        { ...BANKRUPTCY_BAD_CREDIT },
      ],
    };
  }
}
