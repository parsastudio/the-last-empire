import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TreatyAcceptanceApplier } from "@/engine/diplomacy/treaty-acceptance-applier";
import { DiplomaticAcceptanceEvaluator } from "@/engine/diplomacy/diplomatic-acceptance-evaluator";
import { ResearchManager } from "@/engine/politics/research-manager";
import { EspionageManager } from "@/engine/espionage/espionage-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { TurnLogBuilder, GameError } from "@/domain/shared/domain-utilities";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();
  private static researchManager = new ResearchManager();

  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[canonicalSourceId] || state.nations[action.nationId];
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
          state.nations[canonicalTargetId] ||
          state.nations[action.targetNationId];
        if (!receiver) return state;
        const targetKey = receiver.id;

        const senderRel =
          nation.relations[canonicalTargetId] ||
          nation.relations[action.targetNationId];
        const receiverRel =
          receiver.relations[canonicalSourceId] ||
          receiver.relations[action.nationId];
        if (!senderRel || !receiverRel) return state;

        const isReachable = GeopoliticalReachResolver.canInitiateDiplomacy(
          nation,
          receiver,
          state.nations,
          state.provinces,
        );

        if (!isReachable && senderRel.stance !== "WAR") {
          throw new GameError(
            "INVALID_ACTION",
            `کشور ${receiver.name} خارج از شعاع دسترسی ژئوپلیتیک شما قرار دارد.`,
          );
        }

        const canonicalHuman = CountryRegistry.resolveCanonicalId(
          state.humanNationId,
        );
        const isHumanInvolved =
          canonicalSourceId === canonicalHuman ||
          canonicalTargetId === canonicalHuman;

        if (action.proposalType === "DECLARE_WAR") {
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

          if (isHumanInvolved) {
            warLogs.push(
              TurnLogBuilder.createNationalLog(
                state.currentTurn,
                nation.id,
                "DIPLOMACY",
                "CRITICAL",
                "WAR_DECLARED",
                {},
                receiver.id,
              ),
            );
          }

          return {
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
        }

        if (action.proposalType === "SEND_FOREIGN_AID") {
          if (senderRel.stance === "WAR" || receiverRel.stance === "WAR") {
            return state;
          }

          const targetGdp = getNationGdp(receiver, state.provinces);
          const costDeduction =
            TreatyEvaluator.calculateForeignAidCost(targetGdp);

          if (nation.treasury < costDeduction) {
            return state;
          }

          const currentReceiverGrudge = receiverRel.grudge ?? 0;
          const updatedReceiverRel = {
            ...receiverRel,
            opinion: Math.min(100, receiverRel.opinion + 25),
            grudge: Math.max(0, currentReceiverGrudge - 20),
          };

          const newReputation = Math.min(100, nation.globalReputation + 4);

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

          if (isHumanInvolved) {
            aidLogs.push(
              TurnLogBuilder.createNationalLog(
                state.currentTurn,
                nation.id,
                "DIPLOMACY",
                "INFO",
                "FOREIGN_AID_SENT",
                { amount: costDeduction },
                receiver.id,
              ),
            );
          }

          return {
            ...state,
            turnLogs: [...state.turnLogs, ...aidLogs],
            nations: {
              ...state.nations,
              [sourceKey]: {
                ...nation,
                treasury: Math.max(0, nation.treasury - costDeduction),
                globalReputation: newReputation,
              },
              [targetKey]: {
                ...receiver,
                treasury: receiver.treasury + costDeduction,
                relations: {
                  ...receiver.relations,
                  [receiverRel.targetNationId]: updatedReceiverRel,
                },
              },
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
            return TreatyAcceptanceApplier.applyAcceptance(
              state,
              transientProposal,
            );
          } else {
            return TreatyAcceptanceApplier.applyRejection(
              state,
              transientProposal,
            );
          }
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

        const proposalLog = TurnLogBuilder.createNationalLog(
          state.currentTurn,
          nation.id,
          "DIPLOMACY",
          "INFO",
          "DIPLOMATIC_PROPOSAL_SENT",
          { treatyType: action.proposalType },
          receiver.id,
        );

        return {
          ...state,
          pendingProposals: [...state.pendingProposals, transientProposal],
          turnLogs: [...state.turnLogs, proposalLog],
        };
      }

      default:
        return state;
    }
  }
}
