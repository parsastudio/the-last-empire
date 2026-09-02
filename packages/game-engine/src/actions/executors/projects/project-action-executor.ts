import { GameState } from "@/domain/game/game-state.schema";
import { BoostNationalProjectAction } from "@/domain/game/actions/schemas/projects/project-action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  GameError,
  NationalProjectEffectApplierUtility,
  TurnLogBuilder,
} from "@geopolitics/domain";

export class ProjectActionExecutor {
  public static execute(
    state: GameState,
    action: BoostNationalProjectAction,
    nation: Nation,
    buyerKey: string,
  ): { newState: GameState; resultData: unknown } {
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

    const boostedThisTurn = nation.boostedProjectIdsThisTurn || [];
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
          "DILEMMA_RESOLVED",
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
      boostedProjectIdsThisTurn: updatedBoostedList,
      projectProgressSteps: updatedStepsMap,
      completedProjectIds: updatedCompletedList,
    };

    const newState: GameState = {
      ...state,
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
