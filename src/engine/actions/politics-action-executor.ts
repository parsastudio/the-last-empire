import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { ResearchManager } from "@/engine/politics/research-manager";
import { EspionageManager } from "@/engine/espionage/espionage-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();
  private static researchManager = new ResearchManager();

  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalSourceId];
    if (!nation) return state;

    const sourceKey = nation.id;

    switch (action.type) {
      case "UNLOCK_DOCTRINE": {
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: this.researchManager.unlockDoctrine(
              nation,
              action.doctrineId,
            ),
          },
        };
      }

      case "EXECUTE_ESPIONAGE_OPERATION": {
        const { newState } = EspionageManager.executeOperation(
          state,
          action.nationId,
          action.targetNationId,
          action.tier,
        );
        return newState;
      }

      case "DIPLOMATIC_PROPOSAL": {
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId,
        );
        const receiver =
          state.nations[action.targetNationId] ||
          state.nations[canonicalTargetId];
        if (!receiver) return state;
        const targetKey = receiver.id;

        const result = this.treatyEvaluator.evaluateProposal(
          nation,
          receiver,
          action.proposalType,
        );
        if (!result.accepted) return state;

        const senderRel =
          nation.relations[action.targetNationId] ||
          nation.relations[canonicalTargetId];
        const receiverRel =
          receiver.relations[action.nationId] ||
          receiver.relations[canonicalSourceId];
        if (!senderRel || !receiverRel) return state;

        const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
          senderRel,
          action.proposalType,
        );
        const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
          receiverRel,
          action.proposalType,
        );

        let reputationDelta = 0;
        let costDeduction = 0;

        if (action.proposalType === "SEND_FOREIGN_AID") {
          costDeduction = TreatyEvaluator.calculateForeignAidCost(
            getNationGdp(receiver),
          );
          reputationDelta = 4;
        } else if (action.proposalType === "NON_AGGRESSION_PACT") {
          reputationDelta = 3;
        } else if (action.proposalType === "FULL_ALLIANCE") {
          reputationDelta = 6;
        } else if (action.proposalType === "PEACE_TREATY") {
          reputationDelta = 5;
        } else if (action.proposalType === "DECLARE_WAR") {
          reputationDelta = -10;
        }

        const newReputation = Math.max(
          -100,
          Math.min(100, nation.globalReputation + reputationDelta),
        );

        let senderWarFocus = nation.warFocusTargetId;
        let receiverWarFocus = receiver.warFocusTargetId;

        if (action.proposalType === "PEACE_TREATY") {
          if (senderWarFocus === receiver.id) senderWarFocus = null;
          if (receiverWarFocus === nation.id) receiverWarFocus = null;
        } else if (action.proposalType === "DECLARE_WAR") {
          senderWarFocus = receiver.id;
        }

        const senderStabBonus =
          StabilityCalculator.calculateDiplomaticStabilityBonus(
            action.proposalType,
            true,
          );
        const receiverStabBonus =
          StabilityCalculator.calculateDiplomaticStabilityBonus(
            action.proposalType,
            false,
          );

        const newSenderStability = StabilityCalculator.clampStability(
          nation.government.stability + senderStabBonus,
        );
        const newReceiverStability = StabilityCalculator.clampStability(
          receiver.government.stability + receiverStabBonus,
        );

        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              treasury: Math.max(0, nation.treasury - costDeduction),
              globalReputation: newReputation,
              warFocusTargetId: senderWarFocus,
              government: {
                ...nation.government,
                stability: newSenderStability,
              },
              relations: {
                ...nation.relations,
                [senderRel.targetNationId]: updatedSenderRel,
              },
            },
            [targetKey]: {
              ...receiver,
              warFocusTargetId: receiverWarFocus,
              government: {
                ...receiver.government,
                stability: newReceiverStability,
              },
              relations: {
                ...receiver.relations,
                [receiverRel.targetNationId]: updatedReceiverRel,
              },
            },
          },
        };
      }

      default:
        return state;
    }
  }
}
