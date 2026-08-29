import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TreatyAcceptanceApplier } from "@/engine/diplomacy/treaty-acceptance-applier";
import { DiplomaticAcceptanceEvaluator } from "@/engine/diplomacy/diplomatic-acceptance-evaluator";
import { PeaceSettlementExecutor } from "@/engine/diplomacy/peace-settlement-executor";
import { GameError } from "@/domain/shared/domain-utilities";
import { SecurityGuaranteeValidator } from "@geopolitics/domain";
import { DiplomaticProposalExecutor } from "@/engine/diplomacy/executors/diplomatic-proposal-executor";
import { WarDeclarationExecutor } from "@/engine/actions/executors/politics/war-declaration-executor";
import { TreatyTerminationExecutor } from "@/engine/actions/executors/politics/treaty-termination-executor";
import { ForeignAidExecutor } from "@/engine/actions/executors/politics/foreign-aid-executor";

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
          return TreatyTerminationExecutor.handleCancelSecurityGuarantee(
            state,
            nation,
            receiver,
          );
        }

        if (action.proposalType === "CANCEL_TREATY") {
          return TreatyTerminationExecutor.handleCancelTreaty(
            state,
            nation,
            receiver,
            senderRel,
            receiverRel,
            this.treatyEvaluator,
          );
        }

        if (action.proposalType === "DECLARE_WAR") {
          return WarDeclarationExecutor.execute(
            state,
            nation,
            receiver,
            senderRel,
            receiverRel,
            this.treatyEvaluator,
          );
        }

        if (action.proposalType === "SEND_FOREIGN_AID") {
          return ForeignAidExecutor.execute(
            state,
            nation,
            receiver,
            senderRel,
            receiverRel,
            canonicalTargetId,
            canonicalSourceId,
          );
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
