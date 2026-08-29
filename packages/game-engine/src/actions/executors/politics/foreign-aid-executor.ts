import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";

export class ForeignAidExecutor {
  public static execute(
    state: GameState,
    nation: Nation,
    receiver: Nation,
    senderRel: RelationProfile,
    receiverRel: RelationProfile,
    canonicalTargetId: string,
    canonicalSourceId: string,
  ): { newState: GameState; resultData: unknown } {
    const targetGdp = getNationGdp(receiver, state.provinces);
    const costDeduction = TreatyEvaluator.calculateForeignAidCost(targetGdp);

    if (nation.treasury < costDeduction) {
      return { newState: state, resultData: undefined };
    }

    const updatedReceiverRel = {
      ...receiverRel,
      alignment: Math.min(100, (receiverRel.alignment ?? 0) + 25),
      tension: Math.max(0, (receiverRel.tension ?? 10) - 15),
    };

    const updatedSenderRel = {
      ...senderRel,
      alignment: Math.min(100, (senderRel.alignment ?? 0) + 25),
      tension: Math.max(0, (senderRel.tension ?? 10) - 15),
    };

    const senderTargetKey = senderRel.targetNationId || canonicalTargetId;
    const receiverTargetKey = receiverRel.targetNationId || canonicalSourceId;

    const aidLogs = [
      TurnLogBuilder.createGlobalDiplomacyLog(
        state.currentTurn,
        nation.id,
        receiver.id,
        "FOREIGN_AID_SENT",
        { amount: costDeduction },
        "INFO",
      ),
    ];

    const newState = {
      ...state,
      turnLogs: [...state.turnLogs, ...aidLogs],
      nations: {
        ...state.nations,
        [nation.id]: {
          ...nation,
          treasury: Math.max(0, nation.treasury - costDeduction),
          globalReputation: Math.min(100, nation.globalReputation + 1),
          relations: {
            ...nation.relations,
            [senderTargetKey]: updatedSenderRel,
          },
        },
        [receiver.id]: {
          ...receiver,
          treasury: receiver.treasury + costDeduction,
          relations: {
            ...receiver.relations,
            [receiverTargetKey]: updatedReceiverRel,
          },
        },
      },
    };

    return {
      newState,
      resultData: {
        proposalType: "SEND_FOREIGN_AID",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.name,
        targetFlagCode: receiver.flagCode,
        reputationChange: 1,
      },
    };
  }
}
