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
    projectName: string;
    currentStep: number;
    totalSteps: number;
    isCompleted: boolean;
    isEarlyBreakthrough: boolean;
  }> {
    const config = NationalProjectEffectApplierUtility.getProjectConfig(
      action.projectId,
    );
    if (!config) {
      throw new GameError("INVALID_ACTION", "پروژه مورد نظر یافت نشد.");
    }

    const completedIds = nation.completedProjectIds || [];
    if (completedIds.includes(config.id)) {
      throw new GameError(
        "INVALID_ACTION",
        "این پروژه قبلاً با موفقیت تکمیل و بهره‌برداری شده است.",
      );
    }

    const boostedThisTurn =
      state.turnActivity?.[nation.id]?.boostedProjectIds ?? [];
    if (boostedThisTurn.includes(config.id)) {
      throw new GameError(
        "INVALID_ACTION",
        "در هر نوبت حداکثر ۱ بار امکان تزریق بودجه به این پروژه وجود دارد.",
      );
    }

    if (
      boostedThisTurn.length >=
      NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN
    ) {
      throw new GameError(
        "INVALID_ACTION",
        "سقف مجاز پژوهش در این نوبت (۲ پروژه در هر دست) تکمیل شده است.",
      );
    }

    if (nation.treasury < config.costPerStep) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای پرداخت هزینه این گام پژوهشی کافی نیست.",
      );
    }

    const currentSteps = nation.projectProgressSteps?.[config.id] || 0;
    const nextSteps = currentSteps + 1;

    const breakthroughChance = 1 / config.totalStepsRequired;
    const roll = Math.random();
    const isSilentBreakthrough = roll <= breakthroughChance;

    let isCompleted = nextSteps >= config.totalStepsRequired;
    let finalSteps = nextSteps;

    if (isSilentBreakthrough && !isCompleted) {
      isCompleted = true;
      finalSteps = config.totalStepsRequired;
    }

    const nextTreasury = Math.max(0, nation.treasury - config.costPerStep);
    const updatedBoostedList = [...boostedThisTurn, config.id];
    const updatedStepsMap = {
      ...(nation.projectProgressSteps || {}),
      [config.id]: finalSteps,
    };

    const updatedCompletedList = isCompleted
      ? Array.from(new Set([...completedIds, config.id]))
      : completedIds;

    let nextStability = nation.government.stability;
    let nextReputation = nation.globalReputation;

    if (isCompleted) {
      if (config.effect.permanentStabilityBonus) {
        nextStability = Math.min(
          100,
          nextStability + config.effect.permanentStabilityBonus,
        );
      }
      if (config.effect.globalReputationBonus) {
        nextReputation = Math.min(
          100,
          nextReputation + config.effect.globalReputationBonus,
        );
      }
    }

    const newLogs = [];
    if (isCompleted) {
      const message = isSilentBreakthrough
        ? `جهش علمی و دستاورد زودهنگام: دانشمندان کشور با کشف فرمول جدید، پروژه راهبردی «${config.nameFa}» را پیش از موعد به بهره‌برداری رساندند!`
        : `تکمیل برنامه راهبردی: پروژه «${config.nameFa}» با موفقیت ۱۰۰٪ به پایان رسید و امتیازات آن فعال شد.`;

      newLogs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          nation.id,
          "DOMESTIC",
          "INFO",
          "GENERIC_EVENT",
          {
            projectTitle: config.nameFa,
            eventTitle: isSilentBreakthrough
              ? "دستاورد زودهنگام ملی"
              : "تکمیل پروژه راهبردی",
            choiceLabel: message,
          },
          undefined,
          message,
        ),
      );
    }

    const updatedNation: Nation = {
      ...nation,
      treasury: nextTreasury,
      globalReputation: nextReputation,
      projectProgressSteps: updatedStepsMap,
      completedProjectIds: updatedCompletedList,
      government: {
        ...nation.government,
        stability: nextStability,
      },
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
        projectName: config.nameFa,
        currentStep: finalSteps,
        totalSteps: config.totalStepsRequired,
        isCompleted,
        isEarlyBreakthrough: isSilentBreakthrough && isCompleted,
      },
    };
  }
}
