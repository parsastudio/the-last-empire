import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TreatyAcceptanceApplier } from "@/engine/diplomacy/treaty-acceptance-applier";
import { DiplomaticAcceptanceEvaluator } from "@/engine/diplomacy/diplomatic-acceptance-evaluator";
import { PeaceSettlementExecutor } from "@/engine/diplomacy/peace-settlement-executor";
import { GameError } from "@/domain/shared/domain-utilities";
import {
  SecurityGuaranteeValidator,
  NationRelationResolver,
  getNationGdp,
  StrategicPartnershipCalculatorUtility,
  TurnLogBuilder,
  GameIdGenerator,
} from "@geopolitics/domain";
import { DiplomaticProposalExecutor } from "@/engine/diplomacy/executors/diplomatic-proposal-executor";
import { WarDeclarationExecutor } from "@/engine/actions/executors/politics/war-declaration-executor";
import { TreatyTerminationExecutor } from "@/engine/actions/executors/politics/treaty-termination-executor";
import { ForeignAidExecutor } from "@/engine/actions/executors/politics/foreign-aid-executor";
import { ExecutionResult } from "@/engine/actions/execution-result";
import { DiplomaticResultFactory } from "@/engine/diplomacy/diplomatic-result.factory";

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();

  public static execute(state: GameState, action: GameAction): ExecutionResult {
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
              id: GameIdGenerator.generateId("peace"),
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
              resultData: {
                accepted: true,
                proposalType: proposal.proposalType,
              },
            };
          }
          return {
            newState: TreatyAcceptanceApplier.applyAcceptance(state, proposal),
            resultData: { accepted: true, proposalType: proposal.proposalType },
          };
        } else {
          return {
            newState: TreatyAcceptanceApplier.applyRejection(state, proposal),
            resultData: {
              accepted: false,
              proposalType: proposal.proposalType,
            },
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

        const senderRel = NationRelationResolver.getRelation(
          nation.relations,
          canonicalTargetId,
        );
        const receiverRel = NationRelationResolver.getRelation(
          receiver.relations,
          canonicalSourceId,
        );
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
              validation.reason || "عدم احراز شرایط پیمان دفاعی.",
            );
          }
        }

        if (action.proposalType === "STRATEGIC_PARTNERSHIP") {
          if (senderRel.stance !== "NON_AGGRESSION_PACT") {
            throw new GameError(
              "INVALID_ACTION",
              "انعقاد شراکت استراتژیک نیازمند برقراری قبلی پیمان عدم تخاصم است.",
            );
          }
          const receiverGdp = getNationGdp(receiver, state.provinces);
          const entryFee =
            StrategicPartnershipCalculatorUtility.calculateSigningCost(
              receiverGdp,
            );
          if (nation.treasury < entryFee) {
            throw new GameError(
              "INSUFFICIENT_FUNDS",
              "موجودی خزانه برای پرداخت ۳٪ هزینه ورود به شراکت استراتژیک کافی نیست.",
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
          id: GameIdGenerator.generateId("prop"),
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
            state.currentTurn,
          );

          if (isAccepted) {
            const newState = TreatyAcceptanceApplier.applyAcceptance(
              state,
              transientProposal,
            );
            return {
              newState,
              resultData: DiplomaticResultFactory.create({
                proposalType: action.proposalType,
                accepted: true,
                targetNationId: receiver.id,
                targetName: receiver.name,
                targetFlagCode: receiver.flagCode,
                reputationChange: 1,
              }),
            };
          } else {
            const newState = TreatyAcceptanceApplier.applyRejection(
              state,
              transientProposal,
            );
            return {
              newState,
              resultData: DiplomaticResultFactory.create({
                proposalType: action.proposalType,
                accepted: false,
                targetNationId: receiver.id,
                targetName: receiver.name,
                targetFlagCode: receiver.flagCode,
                reputationChange: 0,
              }),
            };
          }
        }

        const proposalLog = TurnLogBuilder.createGlobalDiplomacyLog(
          state.currentTurn,
          nation.id,
          receiver.id,
          "DIPLOMATIC_PROPOSAL_SENT",
          {
            proposalId: transientProposal.id,
            treatyType: action.proposalType,
          },
          "INFO",
        );

        return {
          newState: {
            ...state,
            pendingProposals: [...state.pendingProposals, transientProposal],
            turnLogs: [...state.turnLogs, proposalLog],
          },
          resultData: {
            proposalId: transientProposal.id,
            pending: true,
          },
        };
      }

      default:
        return { newState: state };
    }
  }
}
