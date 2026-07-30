import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";

export class AiGridDecisionMaker {
  public generateAiConquestActions(
    _state: GameState,
    _attackerId: string,
  ): GameAction[] {
    return [];
  }
}
