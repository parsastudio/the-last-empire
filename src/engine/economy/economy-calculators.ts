import { Nation, ActiveModifier } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { TraitManager } from "@/engine/politics/trait-manager";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";

export interface TaxCalculationResult {
  taxIncome: number;
  stabilityImpact: number;
}

export class TaxCalculator {
  public static calculateTaxIncome(
    gdp: number,
    taxRate: number,
    corruption: number,
    unlockedDoctrines?: string[],
  ): number {
    const effectiveTaxRate = Math.min(50, Math.max(0, taxRate));
    const grossIncome = gdp * (effectiveTaxRate / 100);
    const corruptionLoss = grossIncome * (corruption / 100);
    const baseIncome = grossIncome - corruptionLoss;
    const researchMultiplier =
      DoctrinesManager.getGdpTaxRevenueMultiplier(unlockedDoctrines);
    return Math.floor(baseIncome * researchMultiplier);
  }

  public static evaluateTaxPolicy(nation: Nation): TaxCalculationResult {
    const income = TaxCalculator.calculateTaxIncome(
      nation.gdp,
      nation.taxRate,
      nation.government.corruption,
      nation.doctrines.unlockedDoctrines,
    );
    const clampedRate = Math.min(50, Math.max(0, nation.taxRate));
    let stabilityImpact = Number(((15 - clampedRate) * 0.2).toFixed(2));
    if (stabilityImpact < 0) {
      const discount = DoctrinesManager.getTaxStabilityPenaltyDiscount(
        nation.doctrines.unlockedDoctrines,
      );
      stabilityImpact *= discount;
    }
    return {
      taxIncome: income,
      stabilityImpact: Number(stabilityImpact.toFixed(2)),
    };
  }
}

export interface TariffEffectResult {
  tariffRevenue: number;
  stabilityImpact: number;
  tradeVolumePercentage: number;
}

export class TariffCalculator {
  public static calculateTariffEffects(nation: Nation): TariffEffectResult {
    const tariffRate = nation.tariffRate;
    const seaAccessFactor = nation.geography.hasSeaAccess ? 1.0 : 0.5;
    const baseTradeBase = nation.gdp * 0.15 * seaAccessFactor;
    const tradeVolumeFactor = Math.max(
      0.05,
      1.0 - Math.pow(tariffRate / 100, 1.1),
    );
    const tradeVolumePercentage = Math.round(tradeVolumeFactor * 100);
    const effectiveTradeValue = baseTradeBase * tradeVolumeFactor;
    let tariffRevenue = Math.floor(effectiveTradeValue * (tariffRate / 100));
    const researchMultiplier = DoctrinesManager.getTariffRevenueMultiplier(
      nation.doctrines.unlockedDoctrines,
    );
    tariffRevenue = Math.floor(tariffRevenue * researchMultiplier);
    const stabilityImpact = Number(((10 - tariffRate) * 0.08).toFixed(2));
    return {
      tariffRevenue,
      stabilityImpact,
      tradeVolumePercentage,
    };
  }
}

export class GdpCalculator {
  public static calculateBaseGdp(
    population: number,
    infrastructureLevel: number,
  ): number {
    const basePerCapita = 10;
    const infraBonus = 1 + infrastructureLevel * 0.05;
    return Math.floor(population * basePerCapita * infraBonus);
  }

  public static calculateGdpGrowthMultiplier(nation: Nation): number {
    const currentStability = nation.government.stability;
    let stabilityFactor = -0.05 + (currentStability / 100) * 0.075;
    if (nation.traits.includes("FRAGILE_ECONOMY")) {
      stabilityFactor -= 0.05;
    }
    if (nation.geography.territoryPixelCount > 2000) {
      stabilityFactor += 0.015;
    }
    const govTraits = GovernmentSystem.getTraits(nation.government.type);
    stabilityFactor += govTraits.economicGrowthBonus;
    for (const mod of nation.activeModifiers) {
      if (mod.effectType === "GDP_GROWTH_MULT") {
        stabilityFactor += mod.magnitude;
      }
    }
    if (nation.activeModifiers.some((m) => m.id === "martial-law-active")) {
      stabilityFactor -= 0.02;
    }
    return Math.max(0.85, 1.0 + stabilityFactor);
  }

  public static updateNationGdp(nation: Nation): number {
    const growthMult = GdpCalculator.calculateGdpGrowthMultiplier(nation);
    const previousGdp =
      nation.gdp && nation.gdp > 0
        ? nation.gdp
        : GdpCalculator.calculateBaseGdp(
            nation.population,
            nation.geography.infrastructureLevel,
          );
    return Math.floor(previousGdp * growthMult);
  }
}

export interface FinancialUpdateResult {
  netIncome: number;
  newTreasury: number;
  newDebt: number;
  interestPaid: number;
  updatedNation: Nation;
}

export class DebtManager {
  private static readonly INTEREST_RATE = 0.05;

  public processFinancials(
    nation: Nation,
    totalIncome: number,
    totalUpkeep: number,
  ): FinancialUpdateResult {
    const interestDue = Math.floor(
      nation.nationalDebt * DebtManager.INTEREST_RATE,
    );
    const netIncome = totalIncome - totalUpkeep - interestDue;
    let treasury = nation.treasury + netIncome;
    let nationalDebt = nation.nationalDebt;
    if (treasury < 0) {
      nationalDebt += Math.abs(treasury);
      treasury = 0;
    }
    return {
      netIncome,
      newTreasury: treasury,
      newDebt: nationalDebt,
      interestPaid: interestDue,
      updatedNation: { ...nation, treasury, nationalDebt },
    };
  }
}

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

export class InfrastructureManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(1000000000, Math.floor(gdp * 0.1));
  }

  public static upgradeInfrastructure(nation: Nation): Nation {
    const cost = InfrastructureManager.getUpgradeCost(nation);
    if (nation.treasury < cost) return nation;
    return {
      ...nation,
      treasury: nation.treasury - cost,
      gdp: Math.floor(nation.gdp * 1.02),
      geography: {
        ...nation.geography,
        infrastructureLevel: nation.geography.infrastructureLevel + 1,
      },
    };
  }
}

export class IndustrialLevelManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(2000000000, Math.floor(gdp * 0.15));
  }

  public static upgradeIndustrialLevel(nation: Nation): Nation {
    const cost = IndustrialLevelManager.getUpgradeCost(nation);
    if (nation.treasury < cost) return nation;
    return {
      ...nation,
      treasury: nation.treasury - cost,
      industrialLevel: nation.industrialLevel + 1,
    };
  }
}

export interface BreakdownMilitaryPayroll {
  infantry: number;
  airForce: number;
  droneMissile: number;
  total: number;
}

export class MilitaryPayrollCalculator {
  public static calculatePayroll(nation: Nation): BreakdownMilitaryPayroll {
    const traitMultiplier = TraitManager.getMilitaryPayrollMultiplier(nation);
    const govTraits = GovernmentSystem.getTraits(nation.government.type);
    const doctrineMultiplier = DoctrinesManager.getMilitaryPayrollMultiplier(
      nation.doctrines?.unlockedDoctrines,
    );
    const techMultiplier = 1 + (nation.military.techLevel - 1) * 0.2;
    const combined =
      techMultiplier *
      traitMultiplier *
      govTraits.militaryPayrollMultiplier *
      doctrineMultiplier;

    const infantry = Math.floor(
      nation.military.infantry *
        MILITARY_UNIT_STATS.INFANTRY.moneyPayrollBase *
        combined *
        1000000,
    );
    const airForce = Math.floor(
      nation.military.airForce *
        MILITARY_UNIT_STATS.AIR_FORCE.moneyPayrollBase *
        combined *
        1000000,
    );
    const droneMissile = Math.floor(
      nation.military.droneMissile *
        MILITARY_UNIT_STATS.DRONE_MISSILE.moneyPayrollBase *
        combined *
        1000000,
    );
    return {
      infantry,
      airForce,
      droneMissile,
      total: infantry + airForce + droneMissile,
    };
  }
}

export class PopulationGrowthEngine {
  public updatePopulation(nation: Nation): number {
    const stability = Math.max(0, Math.min(100, nation.government.stability));
    const growthRate = stability / 5000 - 0.01;
    return Math.max(
      1,
      nation.population + Math.trunc(nation.population * growthRate),
    );
  }
}

export class ManpowerManager {
  public getMaxManpower(population: number): number {
    return Math.floor(population * 0.15);
  }

  public calculateGrowth(nation: Nation): number {
    if (nation.resources.manpower >= this.getMaxManpower(nation.population))
      return 0;
    return Math.floor(
      Math.floor(nation.population * 0.002) *
        (nation.government.stability / 100),
    );
  }

  public restoreManpower(nation: Nation, amount: number): Nation {
    const newManpower = Math.min(
      this.getMaxManpower(nation.population),
      nation.resources.manpower + amount,
    );
    return {
      ...nation,
      resources: { ...nation.resources, manpower: newManpower },
    };
  }
}

export class ResourceDependencyManager {
  public static validateUnitRecruitmentResources(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): void {
    if (unitType === "AIR_FORCE" || unitType === "DRONE_MISSILE") {
      const requiredSteel = quantity * 2;
      if (nation.resources.steel < requiredSteel) {
        throw new GameError(
          "INSUFFICIENT_RESOURCES",
          `Recruiting advanced unit ${unitType} requires at least ${requiredSteel} steel`,
        );
      }
    }
  }
}
