import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  RecruitUnitAction,
  DeclareWarAction,
} from "@/modules/game-engine/schemas/action.schema";
import { RecruitmentQueueManager } from "@/modules/military/domain/recruitment-queue";
import { ActionHandler } from "./action-handler";

export class RecruitUnitActionHandler implements ActionHandler {
  private recruitmentManager = new RecruitmentQueueManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "RECRUIT_UNIT") {
      return state;
    }
    const recruitAction = action as RecruitUnitAction;
    const source = state.nations[action.nationId];
    if (!source) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.recruitmentManager.enqueueOrder(
          source,
          recruitAction.unitType,
          recruitAction.quantity,
        ),
      },
    };
  }
}

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
      aggressionScore: Math.min(100, source.aggressionScore + 25),
      relations: {
        ...source.relations,
        ...(sourceRel
          ? {
              [warAction.targetNationId]: {
                ...sourceRel,
                stance: "WAR" as const,
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

export class AttackActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "ATTACK") {
      return state;
    }
    const source = state.nations[action.nationId];
    if (!source) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: {
          ...source,
          aggressionScore: Math.min(100, source.aggressionScore + 10),
        },
      },
    };
  }
}
