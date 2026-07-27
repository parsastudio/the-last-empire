import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { AIActionGenerator } from "@/engine/ai/ai-action-generator";
import { PersonalityResolver } from "./personality-resolver";

export class AIEngine {
  private actionGenerator = new AIActionGenerator();
  private personalityResolver = new PersonalityResolver();

  public generateTurnActions(state: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const sortedIds = Object.keys(state.nations).sort();

    for (const id of sortedIds) {
      const nation = state.nations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      const personality = this.personalityResolver.resolveDeterministic(
        id,
        state.gameId,
        state.seed,
      );
      const aiActions = this.actionGenerator.generateActions(
        nation,
        state.nations,
        personality,
      );

      actions.push(...aiActions);
    }

    return actions;
  }
}
