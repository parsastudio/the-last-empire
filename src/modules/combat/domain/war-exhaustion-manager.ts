import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class WarExhaustionManager {
  private readonly maxWarExhaustion = 100;

  public incrementWarExhaustion(
    nation: Nation,
    casualtiesIncurred: number,
  ): Nation {
    const baseIncrement = 2;
    const casualtyFactor = Math.floor(casualtiesIncurred / 100);
    const totalIncrease = baseIncrement + casualtyFactor;

    const newExhaustion = Math.min(
      this.maxWarExhaustion,
      nation.warExhaustion + totalIncrease,
    );

    let stabilityDrop = 0;
    if (newExhaustion > 50) {
      stabilityDrop = Math.floor((newExhaustion - 50) * 0.2);
    }

    const newStability = Math.max(
      0,
      nation.government.stability - stabilityDrop,
    );

    return {
      ...nation,
      warExhaustion: newExhaustion,
      government: {
        ...nation.government,
        stability: newStability,
      },
    };
  }

  public coolDownWarExhaustion(nation: Nation, reductionRate = 5): Nation {
    return {
      ...nation,
      warExhaustion: Math.max(0, nation.warExhaustion - reductionRate),
    };
  }
}
