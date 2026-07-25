import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { AiGridCampaignGenerator } from "@/engine/combat/ai/ai-grid-campaign-generator";

export class AiGridDecisionMaker {
  private campaignGenerator = new AiGridCampaignGenerator();

  public generateAiConquestActions(
    state: GameState,
    attackerId: string,
  ): GameAction[] {
    const gridState: GridState =
      (state as { gridState?: GridState }).gridState || new GridState();
    const allCells = gridState.getAllCells();

    const activeNationsIds = Object.keys(state.nations).filter(
      (id) => id !== attackerId && state.nations[id]?.isAlive,
    );

    const campaigns = this.campaignGenerator.generateCampaignTargets(
      attackerId,
      activeNationsIds,
      allCells,
    );

    const actions: GameAction[] = [];

    for (const [defenderId, target] of campaigns.entries()) {
      const actionId = `ai-conquest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const action: AttackAction = {
        id: actionId,
        nationId: attackerId,
        type: "ATTACK",
        targetNationId: defenderId,
        infantry: target.x,
        airForce: target.y,
        droneMissile: 0,
      };
      actions.push(action);
    }

    return actions;
  }
}
