import { GameState } from "@/domain/game/game-state.schema";
import { BoostNationalProjectAction } from "@/domain/game/actions/schemas/projects/project-action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  GameError,
  NationalProjectEffectApplierUtility,
  TurnLogBuilder,
  DEFAULT_NATION_TURN_ACTIVITY,
} from "@geopolitics/domain";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class ProjectActionExecutor {
  public static execute(
    state: GameState,
    action: BoostNationalProjectAction,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult<{
    projectId: string;
    currentStep: number;
    totalSteps: number;
    currentLevel: number;
    isMilestoneReached: boolean;
    isCompleted: boolean;
  }> {
    const config = NationalProjectEffectApplierUtility.getProjectConfig(
      action.projectId,
    );
    if (!config) {
      throw new GameError("PROJECT_NOT_FOUND");
    }

    const currentSteps = nation.projectProgressSteps?.[config.id] || 0;
    if (currentSteps >= config.totalStepsRequired) {
      throw new GameError("PROJECT_ALREADY_COMPLETED");
    }

    const boostedThisTurn =
      state.turnActivity?.[nation.id]?.boostedProjectIds ?? [];
    if (boostedThisTurn.includes(config.id)) {
      throw new GameError("PROJECT_ALREADY_BOOSTED_THIS_TURN");
    }

    if (
      boostedThisTurn.length >=
      NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN
    ) {
      throw new GameError("MAX_PROJECT_BOOSTS_REACHED");
    }

    if (nation.treasury < config.costPerStep) {
      throw new GameError("INSUFFICIENT_FUNDS");
    }

    const nextSteps = currentSteps + 1;
    const oldLevel =
      NationalProjectEffectApplierUtility.getProjectLevel(currentSteps);
    const nextLevel =
      NationalProjectEffectApplierUtility.getProjectLevel(nextSteps);
    const isMilestoneReached = nextLevel > oldLevel;
    const isCompleted = nextSteps >= config.totalStepsRequired;

    const nextTreasury = Math.max(0, nation.treasury - config.costPerStep);
    const updatedBoostedList = [...boostedThisTurn, config.id];
    const updatedStepsMap = {
      ...(nation.projectProgressSteps || {}),
      [config.id]: nextSteps,
    };

    const completedIds = nation.completedProjectIds || [];
    const updatedCompletedList = isCompleted
      ? Array.from(new Set([...completedIds, config.id]))
      : completedIds;

    const newLogs = [];
    if (isMilestoneReached) {
      newLogs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          nation.id,
          "DOMESTIC",
          "INFO",
          "GENERIC_EVENT",
          {
            projectId: config.id,
            level: nextLevel,
            eventCode: isCompleted
              ? "PROJECT_COMPLETED"
              : "PROJECT_MILESTONE_REACHED",
          },
        ),
      );
    }

    const updatedNation: Nation = {
      ...nation,
      treasury: nextTreasury,
      projectProgressSteps: updatedStepsMap,
      completedProjectIds: updatedCompletedList,
    };

    const updatedTurnActivity = {
      ...(state.turnActivity || {}),
      [nation.id]: {
        ...(state.turnActivity?.[nation.id] || DEFAULT_NATION_TURN_ACTIVITY),
        boostedProjectIds: updatedBoostedList,
      },
    };

    const newState: GameState = {
      ...state,
      turnActivity: updatedTurnActivity,
      nations: {
        ...state.nations,
        [buyerKey]: updatedNation,
      },
      turnLogs: [...state.turnLogs, ...newLogs],
    };

    return {
      newState,
      resultData: {
        projectId: config.id,
        currentStep: nextSteps,
        totalSteps: config.totalStepsRequired,
        currentLevel: nextLevel,
        isMilestoneReached,
        isCompleted,
      },
    };
  }
}
