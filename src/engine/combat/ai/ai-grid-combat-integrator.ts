import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";

export class AiGridCombatIntegrator {
  public generateAiTurns(_state: GameState): GameAction[] {
    return [];
  }
}
