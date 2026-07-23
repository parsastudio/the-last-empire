import type { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";

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
    return {
      ...nation,
      warExhaustion: newExhaustion,
    };
  }

  public coolDownWarExhaustion(nation: Nation, reductionRate = 5): Nation {
    return {
      ...nation,
      warExhaustion: Math.max(0, nation.warExhaustion - reductionRate),
    };
  }
}
