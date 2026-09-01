import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";
import { TurnLogBuilder, GameError } from "@/domain/shared/domain-utilities";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import {
  AIEmergencyDefenseManager,
  ReactiveDefenseEvent,
} from "@/engine/ai/ai-emergency-defense-manager";

export class WarDeclarationExecutor {
  public static execute(
    state: GameState,
    nation: Nation,
    receiver: Nation,
    senderRel: RelationProfile,
    receiverRel: RelationProfile,
    treatyEvaluator: TreatyEvaluator,
  ): { newState: GameState; resultData: unknown } {
    const canReach = GeopoliticalReachResolver.canReachForWarOrStrike(
      nation,
      receiver,
      state.provinces,
    );

    if (!canReach) {
      throw new GameError(
        "GEOPOLITICAL_REACH_DENIED",
        `امکان اعلان جنگ به کشور ${receiver.name} وجود ندارد: عدم وجود مرز زمینی مشترک یا دسترسی دریایی با حداقل ۱ ناوگان فعال.`,
      );
    }

    const updatedSenderRel: RelationProfile = {
      ...treatyEvaluator.applyTreatyStance(senderRel, "DECLARE_WAR"),
      warDeclaredTurn: state.currentTurn,
    };
    const updatedReceiverRel: RelationProfile = {
      ...treatyEvaluator.applyTreatyStance(receiverRel, "DECLARE_WAR"),
      warDeclaredTurn: state.currentTurn,
    };

    const newReputation = Math.max(-100, nation.globalReputation - 5);

    const warLogs = [
      TurnLogBuilder.createGlobalWarLog(
        state.currentTurn,
        nation.id,
        receiver.id,
        "WAR_DECLARED",
        {},
        "CRITICAL",
      ),
    ];

    let newState: GameState = {
      ...state,
      turnLogs: [...state.turnLogs, ...warLogs],
      nations: {
        ...state.nations,
        [nation.id]: {
          ...nation,
          globalReputation: newReputation,
          warFocusTargetId: receiver.id,
          relations: {
            ...nation.relations,
            [senderRel.targetNationId]: updatedSenderRel,
          },
        },
        [receiver.id]: {
          ...receiver,
          warFocusTargetId: receiver.warFocusTargetId || nation.id,
          relations: {
            ...receiver.relations,
            [receiverRel.targetNationId]: updatedReceiverRel,
          },
        },
      },
    };

    let defenseEvent: ReactiveDefenseEvent = { type: "NONE" };

    if (receiver.isAi) {
      const liveReceiver = newState.nations[receiver.id]!;
      const liveNation = newState.nations[nation.id]!;
      const reactiveResult =
        AIEmergencyDefenseManager.handleReactiveDefenseProcurement(
          newState,
          liveNation,
          liveReceiver,
        );
      newState = reactiveResult.newState;
      defenseEvent = reactiveResult.defenseEvent;
    }

    return {
      newState,
      resultData: {
        proposalType: "DECLARE_WAR",
        accepted: true,
        targetNationId: receiver.id,
        targetName: receiver.name,
        targetFlagCode: receiver.flagCode,
        defenseEvent,
      },
    };
  }
}
