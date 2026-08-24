export class DoctrinesManager {
  public static getGdpTaxRevenueMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("automated-supply-chain")) bonus += 0.04;
    if (unlocked.includes("heavy-industry-scale")) bonus += 0.08;
    if (unlocked.includes("cybernetic-optimization")) bonus += 0.06;
    return 1.0 + bonus;
  }

  public static getReputationGainMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("strategic-diplomacy")) bonus += 0.2;
    if (unlocked.includes("hegemonic-diplomatic-order")) bonus += 0.25;
    return 1.0 + bonus;
  }

  public static getMilitaryPayrollMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("cybernetic-optimization") ? 0.85 : 1.0;
  }

  public static getDronePowerMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("tactical-recon-grid")) bonus += 0.15;
    if (unlocked.includes("precision-strike-doctrine")) bonus += 0.1;
    return 1.0 + bonus;
  }

  public static getAirDefenseInterceptionRate(unlocked?: string[]): number {
    if (!unlocked) return 0;
    let rate = 0;
    if (unlocked.includes("layered-air-shield")) rate += 0.2;
    if (unlocked.includes("combined-arms-supremacy")) rate += 0.15;
    return rate;
  }

  public static getPrecisionMissileDirectDamage(unlocked?: string[]): number {
    if (!unlocked) return 0;
    let damageBonus = 0;
    if (unlocked.includes("precision-strike-doctrine")) damageBonus += 0.2;
    if (unlocked.includes("combined-arms-supremacy")) damageBonus += 0.1;
    return damageBonus;
  }

  public static getElectronicWarfareEvasion(unlocked?: string[]): boolean {
    if (!unlocked) return false;
    return unlocked.includes("counter-ew-defense");
  }

  public static getTariffRevenueMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("customs-harmonization")) bonus += 0.12;
    if (unlocked.includes("preferential-trade-pacts")) bonus += 0.1;
    return 1.0 + bonus;
  }

  public static getProxyCostDiscount(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    if (unlocked.includes("hegemonic-diplomatic-order")) return 0.65;
    if (unlocked.includes("deep-espionage-network")) return 0.75;
    return 1.0;
  }

  public static getTaxStabilityPenaltyDiscount(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("fiscal-stabilization") ? 0.7 : 1.0;
  }
}
