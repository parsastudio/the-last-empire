import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { AiGridDecisionMaker } from "@/engine/combat/ai/ai-grid-decision-maker";

export class AiGridCampaignDecider {
  private maker = new AiGridDecisionMaker();

  public evaluateAndGenerateActions(
    state: GameState,
    attackerId: string,
  ): GameAction[] {
    return this.maker.generateAiConquestActions(state, attackerId);
  }
}
