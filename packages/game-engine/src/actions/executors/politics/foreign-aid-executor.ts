import { GameState } from "@/domain/game/game-state.schema";
import {
  Nation,
  DEFAULT_NATION_TURN_ACTIVITY,
} from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { TurnLogBuilder, GameError } from "@/domain/shared/domain-utilities";
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
    const prevSentAidList =
      nation.turnActivity?.sentAidTargetIds ??
      nation.sentAidTargetIdsThisTurn ??
      [];
    if (
      prevSentAidList.includes(canonicalTargetId) ||
      prevSentAidList.includes(receiver.id)
    ) {
      throw new GameError(
        "INVALID_ACTION",
        `بسته کمک مالی به کشور ${receiver.name} در این نوبت قبلاً ارسال شده است. ارسال مجدد در نوبت بعد امکان‌پذیر خواهد بود.`,
      );
    }

    const targetGdp = getNationGdp(receiver, state.provinces);
    const costDeduction = TreatyEvaluator.calculateForeignAidCost(targetGdp);

    if (nation.treasury < costDeduction) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای ارسال بسته کمک مالی کافی نیست.",
      );
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

    const updatedSentList = Array.from(
      new Set([...prevSentAidList, canonicalTargetId, receiver.id]),
    );

    const newState = {
      ...state,
      turnLogs: [...state.turnLogs, ...aidLogs],
      nations: {
        ...state.nations,
        [nation.id]: {
          ...nation,
          treasury: Math.max(0, nation.treasury - costDeduction),
          globalReputation: Math.min(100, nation.globalReputation + 1),
          sentAidTargetIdsThisTurn: updatedSentList,
          turnActivity: {
            ...(nation.turnActivity || DEFAULT_NATION_TURN_ACTIVITY),
            sentAidTargetIds: updatedSentList,
          },
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
