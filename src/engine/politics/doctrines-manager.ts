export class DoctrinesManager {
  public static getGdpTaxRevenueMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("gdp-booster")) bonus += 0.05;
    if (unlocked.includes("cybernetic-automation")) bonus += 0.15;
    return 1.0 + bonus;
  }

  public static getReputationGainMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("trade-diplomacy") ? 1.25 : 1.0;
  }

  public static getMilitaryPayrollMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("cybernetic-automation") ? 0.8 : 1.0;
  }

  public static getDronePowerMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    let bonus = 0;
    if (unlocked.includes("tactical-drones")) bonus += 0.2;
    if (unlocked.includes("precision-missiles")) bonus += 0.25;
    return 1.0 + bonus;
  }

  public static getAirDefenseInterceptionRate(unlocked?: string[]): number {
    if (!unlocked) return 0;
    return unlocked.includes("integrated-air-defense") ? 0.3 : 0;
  }

  public static getPrecisionMissileDirectDamage(unlocked?: string[]): number {
    if (!unlocked) return 0;
    return unlocked.includes("precision-missiles") ? 0.3 : 0;
  }

  public static getElectronicWarfareEvasion(unlocked?: string[]): boolean {
    if (!unlocked) return false;
    return unlocked.includes("electronic-warfare");
  }

  public static getTariffRevenueMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("global-influence") ? 1.15 : 1.0;
  }

  public static getProxyCostDiscount(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("proxy-network") ? 0.75 : 1.0;
  }

  public static getTaxStabilityPenaltyDiscount(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("reputation-recovery") ? 0.5 : 1.0;
  }
}
