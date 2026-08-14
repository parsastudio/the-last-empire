import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { AIReinforcementSubsidizer } from "@/engine/ai/ai-reinforcement-subsidizer";

export class AIEngine {
  public generateTurnActions(state: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const sortedIds = Object.keys(state.nations).sort();

    for (const id of sortedIds) {
      let nation = state.nations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      nation = AIReinforcementSubsidizer.applySubsidiesAndScaling(
        nation,
        state.currentTurn,
      );
      state.nations[id] = nation;

      const aiActions = AIActionBuilder.buildNationActions(
        nation,
        state.nations,
        state.provinces,
      );

      actions.push(...aiActions);
    }

    return actions;
  }
}
