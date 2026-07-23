import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  DeclareWarAction,
} from "@/modules/game-engine/schemas/action.schema";
import type { ActionHandler } from "./action-handler";

export class DeclareWarActionHandler implements ActionHandler {
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

    const updatedSource = {
      ...source,
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
