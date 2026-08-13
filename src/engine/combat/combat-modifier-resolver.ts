import { Nation } from "@/domain/nation/nation.schema";

export class CombatModifierResolver {
  public static calculateDeploymentCosts(
    forceCost: number,
    attackType?: "LAND" | "NAVAL",
    navalCostMultiplier?: number,
  ): {
    moneyCost: number;
  } {
    if (attackType === "NAVAL" && navalCostMultiplier !== undefined) {
      return { moneyCost: Math.floor(forceCost * navalCostMultiplier) };
    }
    return { moneyCost: Math.floor(forceCost * 0.05) };
  }

  public static getEffectiveMultiplier(nation: Nation): number {
    const techLevel = Math.max(1, nation.military.techLevel || 1);
    const techMult = 1 + (techLevel - 1) * 0.5;

    const govType = nation.government.type;
    const govMult =
      govType === "FASCISM" || govType === "DICTATORSHIP" ? 1.2 : 1.0;

    return techMult * govMult;
  }
}
