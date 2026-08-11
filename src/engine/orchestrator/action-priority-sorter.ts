import { GameAction } from "@/domain/game/action.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";

export class ActionPrioritySorter {
  private static getActionPriority(type: string): number {
    switch (type) {
      case "ACTIVATE_ABILITY":
      case "SET_TAX_RATE":
      case "SET_TARIFF_RATE":
        return 1;
      default:
        return 2;
    }
  }

  public sortActions(
    actions: readonly GameAction[],
    prng: SeededRandom,
  ): GameAction[] {
    const sorted = [...actions];

    sorted.sort((a, b) => {
      const priorityA = ActionPrioritySorter.getActionPriority(a.type);
      const priorityB = ActionPrioritySorter.getActionPriority(b.type);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return prng.nextFloat() > 0.5 ? 1 : -1;
    });

    return sorted;
  }
}
