import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";

export class AIEngine {
  public generateTurnActions(
    state: GameState,
    lockedTargets?: Set<string>,
  ): GameAction[] {
    const actions: GameAction[] = [];
    const sortedIds = Object.keys(state.nations).sort();

    for (const id of sortedIds) {
      const nation = state.nations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      const aiActions = AIActionBuilder.buildNationActions(
        nation,
        state.nations,
        state.provinces,
        lockedTargets,
      );

      actions.push(...aiActions);
    }

    return actions;
  }
}
