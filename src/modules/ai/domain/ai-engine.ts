import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import type { AIPersonalityType } from "@/modules/ai/schemas/ai.schema";
import { AIActionGenerator } from "./ai-action-generator";

export class AIEngine {
  private actionGenerator = new AIActionGenerator();

  public generateTurnActions(state: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const sortedIds = Object.keys(state.nations).sort();

    for (const id of sortedIds) {
      const nation = state.nations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      const personality = this.getDeterministicPersonality(id, state.seed);
      const aiActions = this.actionGenerator.generateActions(
        nation,
        state.nations,
        personality,
      );

      actions.push(...aiActions);
    }

    return actions;
  }

  private getDeterministicPersonality(
    nationId: string,
    seed: number,
  ): AIPersonalityType {
    const list: AIPersonalityType[] = [
      "AGGRESSIVE",
      "PACIFIST",
      "ECONOMIC",
      "ISOLATIONIST",
    ];
    let hash = seed;
    for (let i = 0; i < nationId.length; i++) {
      hash += nationId.charCodeAt(i);
    }
    return list[Math.abs(hash) % list.length] || "ECONOMIC";
  }
}
