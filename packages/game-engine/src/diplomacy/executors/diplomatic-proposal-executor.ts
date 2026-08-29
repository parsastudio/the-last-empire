import { GameState } from "@/domain/game/game-state.schema";
import {
  Nation,
  TurnLogBuilder,
  GameError,
  SecurityGuaranteeValidator,
} from "@geopolitics/domain";

export class DiplomaticProposalExecutor {
  public static handleEmergencyProtectorate(
    state: GameState,
    nation: Nation,
    receiver: Nation,
  ): { newState: GameState; resultData: unknown } {
    const validation = SecurityGuaranteeValidator.validate(
      nation,
      receiver,
      state.provinces,
      true,
    );

    if (!validation.isValid) {
      throw new GameError(
        "INVALID_ACTION",
        validation.reason || "عدم احراز شرایط معاهده تحت‌الحمایگی استعماری.",
      );
    }

    const nextReputation = Math.max(-100, nation.globalReputation - 30);
    const nextStability = Math.max(0, nation.government.stability - 15);

    const updatedClient: Nation = {
      ...nation,
      globalReputation: nextReputation,
      securityGuarantorId: receiver.id,
      isEmergencyProtectorate: true,
      government: {
        ...nation.government,
        stability: nextStability,
      },
    };

    const protectorateLog = TurnLogBuilder.createGlobalDiplomacyLog(
      state.currentTurn,
      nation.id,
      receiver.id,
      "EMERGENCY_PROTECTORATE_SIGNED",
      {},
      "CRITICAL",
    );

    const newState: GameState = {
      ...state,
      nations: {
        ...state.nations,
        [nation.id]: updatedClient,
      },
      turnLogs: [...state.turnLogs, protectorateLog],
    };

    return {
      newState,
      resultData: {
        proposalType: "EMERGENCY_PROTECTORATE",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.name,
        targetFlagCode: receiver.flagCode,
        reputationChange: -30,
        message: `معاهده تحت‌الحمایگی با ${receiver.name} امضا شد: اعزام ارتش ۳ برابری فوق‌پیشرفته در ازای ۳۰٪ خراج نوبتی (-۳۰ پرستیژ، -۱۵٪ ثبات).`,
      },
    };
  }

  public static handleCancelProtectorate(
    state: GameState,
    nation: Nation,
    receiver: Nation,
  ): { newState: GameState; resultData: unknown } {
    const updatedClient: Nation = {
      ...nation,
      securityGuarantorId: null,
      isEmergencyProtectorate: false,
    };

    const cancelLog = TurnLogBuilder.createGlobalDiplomacyLog(
      state.currentTurn,
      nation.id,
      receiver.id,
      "EMERGENCY_PROTECTORATE_CANCELLED",
      {},
      "INFO",
    );

    return {
      newState: {
        ...state,
        nations: {
          ...state.nations,
          [nation.id]: updatedClient,
        },
        turnLogs: [...state.turnLogs, cancelLog],
      },
      resultData: {
        proposalType: "CANCEL_EMERGENCY_PROTECTORATE",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.name,
        targetFlagCode: receiver.flagCode,
        message: `معاهده استعماری با ${receiver.name} لغو گردید و خراج نوبتی ۳۰٪ قطع شد.`,
      },
    };
  }
}
