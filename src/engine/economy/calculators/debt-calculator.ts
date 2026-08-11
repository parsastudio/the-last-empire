import { Nation, ActiveModifier } from "@/domain/nation/nation.schema";

export class LoanManager {
  public static calculateCreditRating(nation: Nation): number {
    const debtRatio = nation.gdp > 0 ? nation.nationalDebt / nation.gdp : 1;
    let score = 100;
    score -= Math.min(100, Math.floor(debtRatio * 100));
    score -= Math.min(30, 100 - nation.government.stability);
    if (nation.activeModifiers.some((m) => m.id === "bankruptcy-bad-credit")) {
      score = Math.floor(score * 0.2);
    }
    return Math.max(0, score);
  }
}

export class BankruptcyManager {
  public isBankrupt(nation: Nation): boolean {
    if (nation.activeModifiers.some((m) => m.id === "bankruptcy-debt-holiday"))
      return false;
    if (nation.gdp <= 0) return nation.nationalDebt > 0;
    return nation.nationalDebt / nation.gdp >= 1.0;
  }

  public applyBankruptcy(nation: Nation): Nation {
    const existingModifiers = nation.activeModifiers.filter(
      (m) =>
        ![
          "bankruptcy-structural-decay",
          "bankruptcy-debt-holiday",
          "bankruptcy-bad-credit",
        ].includes(m.id),
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
        turnsRemaining: 10,
      },
      {
        id: "bankruptcy-bad-credit",
        name: "Ruined Credit Rating",
        effectType: "CREDIT_RATING_MULT",
        magnitude: -80,
        turnsRemaining: 10,
      },
    ];
    return {
      ...nation,
      gdp: Math.floor(nation.gdp * 0.9),
      treasury: 0,
      nationalDebt: Math.floor(nation.nationalDebt * 0.75),
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
}
