import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TreatyAcceptanceApplier } from "@/engine/diplomacy/treaty-acceptance-applier";
import { DiplomaticAcceptanceEvaluator } from "@/engine/diplomacy/diplomatic-acceptance-evaluator";
import { EspionageManager } from "@/engine/espionage/espionage-manager";
import { PeaceSettlementExecutor } from "@/engine/diplomacy/peace-settlement-executor";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { TurnLogBuilder, GameError } from "@/domain/shared/domain-utilities";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";
import { SecurityGuaranteeValidator } from "@geopolitics/domain";
import {
  AIEmergencyDefenseManager,
  ReactiveDefenseEvent,
} from "@/engine/ai/ai-emergency-defense-manager";
import { DiplomaticProposalExecutor } from "@/engine/diplomacy/executors/diplomatic-proposal-executor";

export interface PoliticsExecutionOutput {
  newState: GameState;
  resultData?: unknown;
}

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();

  public static execute(
    state: GameState,
    action: GameAction,
  ): PoliticsExecutionOutput {
    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[canonicalSourceId] || state.nations[action.nationId];
    if (!nation) return { newState: state };

    const sourceKey = nation.id;

    switch (action.type) {
      case "SIGN_PEACE_SETTLEMENT": {
        const newState = PeaceSettlementExecutor.execute(state, action);
        return {
          newState,
          resultData: {
            success: true,
            message: "معاهده صلح با موفقیت امضا و شروط آن اعمال گردید.",
          },
        };
      }

      case "EXECUTE_ESPIONAGE_OPERATION": {
        const { newState, result } = EspionageManager.executeOperation(
          state,
          action.nationId,
          action.targetNationId,
          action.tier,
        );
        return { newState, resultData: result };
      }

      case "RESPOND_DIPLOMATIC_PROPOSAL": {
        const proposal = state.pendingProposals.find(
          (p) => p.id === action.proposalId,
        );
        if (!proposal) return { newState: state };

        if (action.accept) {
          if (proposal.proposalType === "PEACE_TREATY") {
            const settlementAction = {
              id: `peace-${Date.now()}`,
              nationId: proposal.receiverNationId,
              targetNationId: proposal.senderNationId,
              type: "SIGN_PEACE_SETTLEMENT" as const,
              proposalId: proposal.id,
            };
            return {
              newState: PeaceSettlementExecutor.execute(
                state,
                settlementAction,
              ),
            };
          }
          return {
            newState: TreatyAcceptanceApplier.applyAcceptance(state, proposal),
          };
        } else {
          return {
            newState: TreatyAcceptanceApplier.applyRejection(state, proposal),
          };
        }
      }

      case "DIPLOMATIC_PROPOSAL": {
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId,
        );
        const receiver =
          state.nations[canonicalTargetId] ||
          state.nations[action.targetNationId];
        if (!receiver) return { newState: state };
        const targetKey = receiver.id;

        const senderRel =
          nation.relations[canonicalTargetId] ||
          nation.relations[action.targetNationId];
        const receiverRel =
          receiver.relations[canonicalSourceId] ||
          receiver.relations[action.nationId];
        if (!senderRel || !receiverRel) return { newState: state };

        if (action.proposalType === "EMERGENCY_PROTECTORATE") {
          return DiplomaticProposalExecutor.handleEmergencyProtectorate(
            state,
            nation,
            receiver,
          );
        }

        if (action.proposalType === "CANCEL_EMERGENCY_PROTECTORATE") {
          return DiplomaticProposalExecutor.handleCancelProtectorate(
            state,
            nation,
            receiver,
          );
        }

        if (action.proposalType === "SECURITY_GUARANTEE") {
          const validation = SecurityGuaranteeValidator.validate(
            nation,
            receiver,
            state.provinces,
            false,
          );
          if (!validation.isValid) {
            throw new GameError(
              "INVALID_ACTION",
              validation.reason || "عدم احراز شرایط چتر امنیتی.",
            );
          }
        }

        if (action.proposalType === "CANCEL_SECURITY_GUARANTEE") {
          const newState = {
            ...state,
            nations: {
              ...state.nations,
              [sourceKey]: {
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

        if (action.proposalType === "CANCEL_TREATY") {
          const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
            senderRel,
            "CANCEL_TREATY",
          );
          const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
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
              [sourceKey]: {
                ...nation,
                globalReputation: newReputation,
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

        if (action.proposalType === "DECLARE_WAR") {
          const hasLandBorder = GeopoliticalReachResolver.hasDirectLandBorder(
            nation,
            receiver,
            state.provinces,
          );

          if (!hasLandBorder) {
            throw new GameError(
              "INVALID_ACTION",
              `امکان اعلان جنگ به کشور ${receiver.name} وجود ندارد: عدم وجود مرز زمینی مشترک.`,
            );
          }

          const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
            senderRel,
            "DECLARE_WAR",
          );
          const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
            receiverRel,
            "DECLARE_WAR",
          );

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

          let defenseEvent: ReactiveDefenseEvent = { type: "NONE" };

          if (receiver.isAi) {
            const liveReceiver = newState.nations[targetKey]!;
            const liveNation = newState.nations[sourceKey]!;
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

        if (action.proposalType === "SEND_FOREIGN_AID") {
          const targetGdp = getNationGdp(receiver, state.provinces);
          const costDeduction =
            TreatyEvaluator.calculateForeignAidCost(targetGdp);

          if (nation.treasury < costDeduction) {
            return { newState: state };
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
          const receiverTargetKey =
            receiverRel.targetNationId || canonicalSourceId;

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
              [sourceKey]: {
                ...nation,
                treasury: Math.max(0, nation.treasury - costDeduction),
                globalReputation: Math.min(100, nation.globalReputation + 1),
                relations: {
                  ...nation.relations,
                  [senderTargetKey]: updatedSenderRel,
                },
              },
              [targetKey]: {
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

        const transientProposal = {
          id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: state.currentTurn,
          senderNationId: nation.id,
          receiverNationId: receiver.id,
          proposalType: action.proposalType,
          expiresTurn: state.currentTurn + 2,
        };

        if (receiver.isAi) {
          const isAccepted = DiplomaticAcceptanceEvaluator.evaluate(
            transientProposal,
            receiver,
            nation,
            state.nations,
            state.provinces,
          );

          if (isAccepted) {
            const newState = TreatyAcceptanceApplier.applyAcceptance(
              state,
              transientProposal,
            );
            return {
              newState,
              resultData: {
                proposalType: action.proposalType,
                accepted: true,
                targetNationId: receiver.id,
                targetName: receiver.name,
                targetFlagCode: receiver.flagCode,
                reputationChange: 1,
              },
            };
          } else {
            const newState = TreatyAcceptanceApplier.applyRejection(
              state,
              transientProposal,
            );
            return {
              newState,
              resultData: {
                proposalType: action.proposalType,
                accepted: false,
                targetNationId: receiver.id,
                targetName: receiver.name,
                targetFlagCode: receiver.flagCode,
                reputationChange: 0,
              },
            };
          }
        }

        return {
          newState: {
            ...state,
            pendingProposals: [...state.pendingProposals, transientProposal],
          },
        };
      }

      default:
        return { newState: state };
    }
  }
}
