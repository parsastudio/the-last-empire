import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { AiGridDecisionMaker } from "@/engine/combat/ai/ai-grid-decision-maker";

export class AiGridCombatIntegrator {
  private decisionMaker = new AiGridDecisionMaker();

  public generateAiTurns(state: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const activeNationsIds = Object.keys(state.nations).filter(
      (id) => state.nations[id]?.isAlive && state.nations[id]?.isAi,
    );

    for (let i = 0; i < activeNationsIds.length; i++) {
      const id = activeNationsIds[i]!;
      const aiActions = this.decisionMaker.generateAiConquestActions(state, id);
      actions.push(...aiActions);
    }

    return actions;
  }
}
