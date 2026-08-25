import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { TreatyAcceptanceApplier } from "@/engine/diplomacy/treaty-acceptance-applier";
import { DiplomaticAcceptanceEvaluator } from "@/engine/diplomacy/diplomatic-acceptance-evaluator";
import { EspionageManager } from "@/engine/espionage/espionage-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { TurnLogBuilder, GameError } from "@/domain/shared/domain-utilities";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";
import { NationGettersUtility } from "@geopolitics/domain";
import {
  AIEmergencyDefenseManager,
  ReactiveDefenseEvent,
} from "@/engine/ai/ai-emergency-defense-manager";

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

        const canonicalHuman = CountryRegistry.resolveCanonicalId(
          state.humanNationId,
        );
        const isHumanInvolved =
          canonicalSourceId === canonicalHuman ||
          canonicalTargetId === canonicalHuman;

        if (action.proposalType === "CANCEL_TREATY") {
          const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
            senderRel,
            "CANCEL_TREATY",
          );
          const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
            receiverRel,
            "CANCEL_TREATY",
          );

          const prevStance = senderRel.stance;
          const newStanceName =
            prevStance === "ALLIANCE" ? "پیمان عدم تخاصم" : "دیپلماسی عادی";

          const newReputation = Math.max(-100, nation.globalReputation - 2);

          const cancelLogs = [
            TurnLogBuilder.createGlobalDiplomacyLog(
              state.currentTurn,
              nation.id,
              receiver.id,
              "TREATY_CANCELLED",
              { prevStance, newStanceName },
              "WARNING",
            ),
          ];

          if (isHumanInvolved) {
            cancelLogs.push(
              TurnLogBuilder.createNationalLog(
                state.currentTurn,
                nation.id,
                "DIPLOMACY",
                "WARNING",
                "TREATY_CANCELLED",
                { prevStance, newStanceName },
                receiver.id,
              ),
            );
          }

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
              message: `معاهده قبلی لغو گردید و سطح روابط با کشور ${receiver.name} به (${newStanceName}) تنزل یافت.`,
            },
          };
        }

        if (action.proposalType === "DECLARE_WAR") {
          const hasLandBorder = GeopoliticalReachResolver.hasDirectLandBorder(
            nation,
            receiver,
            state.provinces,
          );
          const sourceSea = NationGettersUtility.hasSeaAccess(
            nation.id,
            state.provinces,
          );
          const targetSea = NationGettersUtility.hasSeaAccess(
            receiver.id,
            state.provinces,
          );
          const hasNavalAccess = sourceSea && targetSea;

          if (!hasLandBorder && !hasNavalAccess) {
            throw new GameError(
              "INVALID_ACTION",
              `امکان اعلان جنگ به کشور ${receiver.name} وجود ندارد: عدم وجود مرز زمینی مشترک یا دسترسی همزمان به آب‌های آزاد.`,
            );
          }

          if (nation.isAi) {
            const isReachable = GeopoliticalReachResolver.canInitiateDiplomacy(
              nation,
              receiver,
              state.nations,
              state.provinces,
            );

            if (!isReachable) {
              throw new GameError(
                "INVALID_ACTION",
                `کشور ${receiver.name} خارج از شعاع دسترسی ژئوپلیتیک شما قرار دارد.`,
              );
            }
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

        if (nation.isAi) {
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
        }

        if (action.proposalType === "SEND_FOREIGN_AID") {
          if (senderRel.stance === "WAR" || receiverRel.stance === "WAR") {
            return { newState: state };
          }

          const targetGdp = getNationGdp(receiver, state.provinces);
          const costDeduction =
            TreatyEvaluator.calculateForeignAidCost(targetGdp);

          if (nation.treasury < costDeduction) {
            return { newState: state };
          }

          const currentReceiverAlignment = receiverRel.alignment ?? 0;
          const currentReceiverTension = receiverRel.tension ?? 10;

          const updatedReceiverRel = {
            ...receiverRel,
            alignment: Math.min(100, currentReceiverAlignment + 25),
            tension: Math.max(0, currentReceiverTension - 15),
          };

          const newReputation = Math.min(100, nation.globalReputation + 1);

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

          const newState = {
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

          return {
            newState,
            resultData: {
              proposalType: "SEND_FOREIGN_AID",
              accepted: true,
              targetNationId: receiver.id,
              targetName: receiver.name,
              targetFlagCode: receiver.flagCode,
              reputationChange: 1,
              message: `بسته کمک مالی و دیپلماتیک به خزانه‌داری ${receiver.name} واریز شد (+۲۵ همسویی، +۱ پرستیژ جهانی).`,
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

            let acceptedMsg = `دولت ${receiver.name} با پیشنهاد شما موافقت کرد.`;
            if (action.proposalType === "FULL_ALLIANCE") {
              acceptedMsg = `دولت ${receiver.name} معاهده اتحاد کامل را امضا کرد! دو کشور رسماً متحد استراتژیک شدند.`;
            } else if (action.proposalType === "NON_AGGRESSION_PACT") {
              acceptedMsg = `دولت ${receiver.name} پیمان عدم تخاصم را پذیرفت و امنیت مرزهای مشترک برقرار شد.`;
            } else if (action.proposalType === "PEACE_TREATY") {
              acceptedMsg = `دولت ${receiver.name} معاهده صلح را امضا کرد و به درگیری‌های نظامی پایان داد.`;
            }

            return {
              newState,
              resultData: {
                proposalType: action.proposalType,
                accepted: true,
                targetNationId: receiver.id,
                targetName: receiver.name,
                targetFlagCode: receiver.flagCode,
                reputationChange: 1,
                message: acceptedMsg,
              },
            };
          } else {
            const newState = TreatyAcceptanceApplier.applyRejection(
              state,
              transientProposal,
            );

            let rejectedMsg = `دولت ${receiver.name} پیشنهاد شما را در شرایط فعلی رد کرد.`;
            if (action.proposalType === "FULL_ALLIANCE") {
              rejectedMsg = `دولت ${receiver.name} پیشنهاد اتحاد نظامی را رد کرد. سطح همسویی برای اتحاد کافی نیست.`;
            } else if (action.proposalType === "NON_AGGRESSION_PACT") {
              rejectedMsg = `دولت ${receiver.name} پیشنهاد پیمان عدم تخاصم را رد کرد. تنش‌های مرزی مانع توافق شد.`;
            } else if (action.proposalType === "PEACE_TREATY") {
              rejectedMsg = `دولت ${receiver.name} پیشنهاد صلح را رد کرد و اعلام نمود تا تحقق شروط خود به نبرد ادامه خواهد داد.`;
            }

            return {
              newState,
              resultData: {
                proposalType: action.proposalType,
                accepted: false,
                targetNationId: receiver.id,
                targetName: receiver.name,
                targetFlagCode: receiver.flagCode,
                reputationChange: 0,
                message: rejectedMsg,
              },
            };
          }
        }

        const isDuplicate = state.pendingProposals.some(
          (p) =>
            p.senderNationId === nation.id &&
            p.receiverNationId === receiver.id &&
            p.proposalType === action.proposalType,
        );

        if (isDuplicate) {
          return { newState: state };
        }

        const proposalLog = TurnLogBuilder.createNationalLog(
          state.currentTurn,
          nation.id,
          "DIPLOMACY",
          "INFO",
          "DIPLOMATIC_PROPOSAL_SENT",
          {
            treatyType: action.proposalType,
            proposalId: transientProposal.id,
          },
          receiver.id,
        );

        return {
          newState: {
            ...state,
            pendingProposals: [...state.pendingProposals, transientProposal],
            turnLogs: [...state.turnLogs, proposalLog],
          },
        };
      }

      default:
        return { newState: state };
    }
  }
}
