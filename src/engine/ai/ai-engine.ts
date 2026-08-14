import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { AIReinforcementSubsidizer } from "@/engine/ai/ai-reinforcement-subsidizer";

export class AIEngine {
  public generateTurnActions(state: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const sortedIds = Object.keys(state.nations).sort();
    const clonedNations = { ...state.nations };

    for (const id of sortedIds) {
      let nation = clonedNations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      nation = AIReinforcementSubsidizer.applySubsidiesAndScaling(
        nation,
        state.currentTurn,
      );
      clonedNations[id] = nation;

      const aiActions = AIActionBuilder.buildNationActions(
        nation,
        clonedNations,
        state.provinces,
      );

      actions.push(...aiActions);
    }

    return actions;
  }
}
