import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";

export class TreatyTerminationExecutor {
  public static handleCancelSecurityGuarantee(
    state: GameState,
    nation: Nation,
    receiver: Nation,
  ): { newState: GameState; resultData: unknown } {
    const newState = {
      ...state,
      nations: {
        ...state.nations,
        [nation.id]: {
          ...nation,
          securityGuarantorId: null,
          isEmergencyProtectorate: false,
        },
      },
      turnLogs: [
        ...state.turnLogs,
        TurnLogBuilder.createGlobalDiplomacyLog(
          state.currentTurn,
          nation.id,
          receiver.id,
          "SECURITY_GUARANTEE_CANCELLED",
          { reason: "فسخ اختیاری" },
          "INFO",
        ),
      ],
    };

    return {
      newState,
      resultData: {
        proposalType: "CANCEL_SECURITY_GUARANTEE",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.name,
        targetFlagCode: receiver.flagCode,
        message: `پیمان چتر امنیتی با کشور ${receiver.name} لغو گردید.`,
      },
    };
  }

  public static handleCancelTreaty(
    state: GameState,
    nation: Nation,
    receiver: Nation,
    senderRel: RelationProfile,
    receiverRel: RelationProfile,
    treatyEvaluator: TreatyEvaluator,
  ): { newState: GameState; resultData: unknown } {
    const updatedSenderRel = treatyEvaluator.applyTreatyStance(
      senderRel,
      "CANCEL_TREATY",
    );
    const updatedReceiverRel = treatyEvaluator.applyTreatyStance(
      receiverRel,
      "CANCEL_TREATY",
    );

    const newReputation = Math.max(-100, nation.globalReputation - 2);

    const cancelLogs = [
      TurnLogBuilder.createGlobalDiplomacyLog(
        state.currentTurn,
        nation.id,
        receiver.id,
        "TREATY_CANCELLED",
        {},
        "WARNING",
      ),
    ];

    const newState = {
      ...state,
      turnLogs: [...state.turnLogs, ...cancelLogs],
      nations: {
        ...state.nations,
        [nation.id]: {
          ...nation,
          globalReputation: newReputation,
          relations: {
            ...nation.relations,
            [senderRel.targetNationId]: updatedSenderRel,
          },
        },
        [receiver.id]: {
          ...receiver,
          relations: {
            ...receiver.relations,
            [receiverRel.targetNationId]: updatedReceiverRel,
          },
        },
      },
    };

    return {
      newState,
      resultData: {
        proposalType: "CANCEL_TREATY",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.name,
        targetFlagCode: receiver.flagCode,
        reputationChange: -2,
      },
    };
  }
}
