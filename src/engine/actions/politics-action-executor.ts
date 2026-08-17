import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TreatyAcceptanceApplier } from "@/engine/diplomacy/treaty-acceptance-applier";
import { ResearchManager } from "@/engine/politics/research-manager";
import { EspionageManager } from "@/engine/espionage/espionage-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";

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

      case "RESPOND_DIPLOMATIC_PROPOSAL": {
        const proposal = state.pendingProposals.find(
          (p) => p.id === action.proposalId,
        );
        if (!proposal) return state;

        if (action.accept) {
          return TreatyAcceptanceApplier.applyAcceptance(state, proposal);
        } else {
          return TreatyAcceptanceApplier.applyRejection(state, proposal);
        }
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

        const senderRel =
          nation.relations[action.targetNationId] ||
          nation.relations[canonicalTargetId];
        const receiverRel =
          receiver.relations[action.nationId] ||
          receiver.relations[canonicalSourceId];
        if (!senderRel || !receiverRel) return state;

        if (action.proposalType === "DECLARE_WAR") {
          const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
            senderRel,
            "DECLARE_WAR",
          );
          const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
            receiverRel,
            "DECLARE_WAR",
          );

          const newReputation = Math.max(-100, nation.globalReputation - 10);
          const warLog = TurnLogBuilder.createLogEntry(
            state.currentTurn,
            nation.id,
            "CRITICAL",
            `کشور ${nation.name} به ${receiver.name} اعلان جنگ رسمی نمود.`,
          );

          return {
            ...state,
            turnLogs: [...state.turnLogs, warLog],
            nations: {
              ...state.nations,
              [sourceKey]: {
                ...nation,
                globalReputation: newReputation,
                warFocusTargetId: receiver.id,
                relations: {
                  ...nation.relations,
                  [senderRel.targetNationId]: updatedSenderRel,
                },
              },
              [targetKey]: {
                ...receiver,
                warFocusTargetId: receiver.warFocusTargetId || nation.id,
                relations: {
                  ...receiver.relations,
                  [receiverRel.targetNationId]: updatedReceiverRel,
                },
              },
            },
          };
        }

        if (action.proposalType === "SEVER_TRADE_RELATIONS") {
          const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
            senderRel,
            "SEVER_TRADE_RELATIONS",
          );
          const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
            receiverRel,
            "SEVER_TRADE_RELATIONS",
          );

          return {
            ...state,
            nations: {
              ...state.nations,
              [sourceKey]: {
                ...nation,
                relations: {
                  ...nation.relations,
                  [senderRel.targetNationId]: updatedSenderRel,
                },
              },
              [targetKey]: {
                ...receiver,
                relations: {
                  ...receiver.relations,
                  [receiverRel.targetNationId]: updatedReceiverRel,
                },
              },
            },
          };
        }

        if (action.proposalType === "SEND_FOREIGN_AID") {
          const costDeduction = TreatyEvaluator.calculateForeignAidCost(
            getNationGdp(nation),
            getNationGdp(receiver),
          );

          if (nation.treasury < costDeduction) {
            return state;
          }

          const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
            senderRel,
            "SEND_FOREIGN_AID",
          );
          const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
            receiverRel,
            "SEND_FOREIGN_AID",
          );

          const newReputation = Math.min(100, nation.globalReputation + 4);
          const senderStabBonus =
            StabilityCalculator.calculateDiplomaticStabilityBonus(
              "SEND_FOREIGN_AID",
              true,
            );
          const receiverStabBonus =
            StabilityCalculator.calculateDiplomaticStabilityBonus(
              "SEND_FOREIGN_AID",
              false,
            );

          return {
            ...state,
            nations: {
              ...state.nations,
              [sourceKey]: {
                ...nation,
                treasury: Math.max(0, nation.treasury - costDeduction),
                globalReputation: newReputation,
                government: {
                  ...nation.government,
                  stability: StabilityCalculator.clampStability(
                    nation.government.stability + senderStabBonus,
                  ),
                },
                relations: {
                  ...nation.relations,
                  [senderRel.targetNationId]: updatedSenderRel,
                },
              },
              [targetKey]: {
                ...receiver,
                treasury: receiver.treasury + costDeduction,
                government: {
                  ...receiver.government,
                  stability: StabilityCalculator.clampStability(
                    receiver.government.stability + receiverStabBonus,
                  ),
                },
                relations: {
                  ...receiver.relations,
                  [receiverRel.targetNationId]: updatedReceiverRel,
                },
              },
            },
          };
        }

        const isDuplicate = state.pendingProposals.some(
          (p) =>
            p.senderNationId === nation.id &&
            p.receiverNationId === receiver.id &&
            p.proposalType === action.proposalType,
        );

        if (isDuplicate) {
          return state;
        }

        const newProposal = {
          id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: state.currentTurn,
          senderNationId: nation.id,
          receiverNationId: receiver.id,
          proposalType: action.proposalType,
          expiresTurn: state.currentTurn + 2,
        };

        const proposalLog = TurnLogBuilder.createLogEntry(
          state.currentTurn,
          nation.id,
          "INFO",
          `پیشنهاد رسمی (${action.proposalType}) از سوی ${nation.name} برای ${receiver.name} ارسال گردید.`,
        );

        return {
          ...state,
          pendingProposals: [...state.pendingProposals, newProposal],
          turnLogs: [...state.turnLogs, proposalLog],
        };
      }

      default:
        return state;
    }
  }
}
