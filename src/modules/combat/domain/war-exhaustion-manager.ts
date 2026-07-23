import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";

export class WarExhaustionManager {
  private readonly maxWarExhaustion = 100;
  private governmentSystem = new GovernmentSystem();

  public incrementWarExhaustion(
    nation: Nation,
    casualtiesIncurred: number,
  ): Nation {
    const baseIncrement = 2;
    const casualtyFactor = Math.floor(casualtiesIncurred / 100);
    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    const totalIncrease = Math.floor(
      (baseIncrement + casualtyFactor) * govTraits.warExhaustionMultiplier,
    );
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
