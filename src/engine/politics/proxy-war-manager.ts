import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export class ProxyWarManager {
  public static calculateBudget(
    targetGdp: number,
    desiredDrainPercent: number,
    unlockedDoctrines?: string[],
  ): number {
    if (targetGdp <= 0 || desiredDrainPercent <= 0) return 0;
    const discount = DoctrinesManager.getProxyCostDiscount(unlockedDoctrines);
    return Math.floor(targetGdp * (desiredDrainPercent / 2) * 0.01 * discount);
  }
}
