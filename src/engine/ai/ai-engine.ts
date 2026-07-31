import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { AIPersonalityType } from "@/domain/ai/ai.schema";
import { AIActionBuilder } from "./ai-action-builder";

export class AIEngine {
  public generateTurnActions(state: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const sortedIds = Object.keys(state.nations).sort();

    for (const id of sortedIds) {
      const nation = state.nations[id];
      if (!nation || !nation.isAlive || !nation.isAi) {
        continue;
      }

      const personality = this.resolvePersonality(id, state.gameId, state.seed);
      const aiActions = AIActionBuilder.buildNationActions(
        nation,
        state.nations,
        personality,
        state.currentTurn,
      );

      actions.push(...aiActions);
    }

    return actions;
  }

  private resolvePersonality(
    nationId: string,
    gameId: string,
    seed: number,
  ): AIPersonalityType {
    const personalities: AIPersonalityType[] = [
      "AGGRESSIVE",
      "PACIFIST",
      "ECONOMIC",
      "ISOLATIONIST",
    ];
    let hash = seed;
    for (let i = 0; i < gameId.length; i++) {
      hash += gameId.charCodeAt(i);
    }
    for (let i = 0; i < nationId.length; i++) {
      hash += nationId.charCodeAt(i);
    }
    return personalities[Math.abs(hash) % personalities.length] || "ECONOMIC";
  }
}
