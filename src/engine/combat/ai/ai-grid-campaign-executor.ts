import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { AiGridCombatIntegrator } from "@/engine/combat/ai/ai-grid-combat-integrator";

export class AiGridCampaignExecutor {
  private integrator = new AiGridCombatIntegrator();

  public executeCampaignActions(state: GameState, queue: GameAction[]): void {
    const actions = this.integrator.generateAiTurns(state);
    queue.push(...actions);
  }
}
