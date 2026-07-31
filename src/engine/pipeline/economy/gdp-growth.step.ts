import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { GdpCalculator } from "@/engine/economy/gdp-calculator";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export class GdpGrowthStep implements EconomyStep {
  private gdpCalc = new GdpCalculator();
  private doctrinesManager = new DoctrinesManager();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const rawGdp = this.gdpCalc.updateNationGdp(nation);
      const doctrineGdpBonus = this.doctrinesManager.getGdpGrowthModifier(
        nation.doctrines.unlockedDoctrines,
      );

      nations[id] = {
        ...nation,
        gdp: Math.floor(rawGdp * (1.0 + doctrineGdpBonus)),
      };
    }
  }
}
