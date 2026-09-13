import { GameState } from "@/domain/game/game-state.schema";
import {
  Nation,
  TurnLogBuilder,
  GameError,
  SecurityGuaranteeValidator,
} from "@geopolitics/domain";
import { DiplomaticResultFactory } from "@/engine/diplomacy/diplomatic-result.factory";

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
        validation.reasonCode || "INVALID_ACTION",
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
      resultData: DiplomaticResultFactory.create({
        proposalType: "EMERGENCY_PROTECTORATE",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.id,
        targetFlagCode: receiver.flagCode,
        reputationChange: -30,
        message: "EMERGENCY_PROTECTORATE_SIGNED",
      }),
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
      resultData: DiplomaticResultFactory.create({
        proposalType: "CANCEL_EMERGENCY_PROTECTORATE",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.id,
        targetFlagCode: receiver.flagCode,
        message: "EMERGENCY_PROTECTORATE_CANCELLED",
      }),
    };
  }
}
