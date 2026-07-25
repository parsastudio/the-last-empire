import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { TributeManager } from "@/engine/diplomacy/tribute-manager";

export class TributeStep implements EconomyStep {
  private tributeManager = new TributeManager();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      for (const [targetId, relation] of Object.entries(nation.relations)) {
        if (relation.tributePerTurn > 0) {
          const targetNation = nations[targetId];
          if (targetNation && targetNation.isAlive) {
            const result = this.tributeManager.processTurnTributes(
              nations[id]!,
              nations[targetId]!,
            );
            nations[id] = result.nation;
            nations[targetId] = result.targetNation;
          }
        }
      }
    }
  }
}
