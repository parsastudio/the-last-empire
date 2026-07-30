import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction, DeclareWarAction } from "@/domain/game/action.schema";
import { CoolOffManager } from "@/engine/diplomacy/cool-off-manager";
import type { ActionHandler } from "@/engine/actions/action-handler";

export class DeclareWarActionHandler implements ActionHandler {
  private coolOffManager = new CoolOffManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "DECLARE_WAR") {
      return state;
    }
    const warAction = action as DeclareWarAction;
    const source = state.nations[action.nationId];
    const target = state.nations[warAction.targetNationId];
    if (!source || !target || !target.isAlive) {
      return state;
    }
    const sourceRel = source.relations[warAction.targetNationId];
    const targetRel = target.relations[action.nationId];

    const currentStance = sourceRel ? sourceRel.stance : "PEACE";
    const coolOffTurns = sourceRel ? sourceRel.coolOffTurnsRemaining : 0;
    const penalties = this.coolOffManager.checkViolation(
      currentStance,
      "DECLARE_WAR",
      coolOffTurns,
    );

    let finalSourceReputation = source.globalReputation;
    let finalSourceStability = source.government.stability;

    if (penalties.reputationPenalty > 0 || penalties.stabilityPenalty > 0) {
      finalSourceReputation = Math.max(
        -100,
        source.globalReputation - penalties.reputationPenalty,
      );
      finalSourceStability = Math.max(
        0,
        source.government.stability - penalties.stabilityPenalty,
      );
    }

    const updatedSource = {
      ...source,
      globalReputation: finalSourceReputation,
      government: {
        ...source.government,
        stability: finalSourceStability,
      },
      globalAggression: Math.min(100, source.globalAggression + 25),
      relations: {
        ...source.relations,
        ...(sourceRel
          ? {
              [warAction.targetNationId]: {
                ...sourceRel,
                stance: "WAR" as const,
                opinion: Math.max(-100, sourceRel.opinion - 80),
              },
            }
          : {}),
      },
    };
    const updatedTarget = {
      ...target,
      relations: {
        ...target.relations,
        ...(targetRel
          ? {
              [action.nationId]: {
                ...targetRel,
                stance: "WAR" as const,
                opinion: Math.max(-100, targetRel.opinion - 80),
              },
            }
          : {}),
      },
    };
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: updatedSource,
        [warAction.targetNationId]: updatedTarget,
      },
    };
  }
}
