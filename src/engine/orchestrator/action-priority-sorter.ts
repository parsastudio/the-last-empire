import { GameAction } from "@/domain/game/action.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";

export class ActionPrioritySorter {
  private static getActionPriority(type: string): number {
    switch (type) {
      case "ACTIVATE_ABILITY":
      case "SET_TAX_RATE":
      case "SET_TARIFF_RATE":
      case "CONFIGURE_AUTO_TRADE":
        return 1;
      case "TRADE_RESOURCES":
        return 2;
      default:
        return 3;
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
      if (priorityA === 2) {
        return prng.nextFloat() > 0.5 ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }
}
