import type { GameState } from "@/core/types/game-state.types";
import type { GameAction } from "@/core/types/actions.types";
import type { AIPersonalityType } from "@/core/types/ai.types";
import { AIActionGenerator } from "./ai-action-generator";

export class AIEngine {
  private actionGenerator = new AIActionGenerator();

  public generateTurnActions(state: GameState): GameAction[] {
    const actions: GameAction[] = [];

    for (const [id, nation] of Object.entries(state.nations)) {
      if (!nation.isAlive || !nation.isAi) {
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
