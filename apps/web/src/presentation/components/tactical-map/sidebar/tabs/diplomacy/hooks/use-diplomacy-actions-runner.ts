import { useState, useMemo } from "react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory, DiplomaticStance } from "@geopolitics/domain";
import {
  DiplomaticBetrayalCalculator,
  TreatyEvaluator,
} from "@geopolitics/game-engine";
import { DiplomaticProposalFeedback } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/diplomatic-feedback-modal";

interface UseDiplomacyActionsRunnerProps {
  targetName: string;
  targetNationId: string;
  nationId: string;
  senderGdp?: number;
  targetGdp?: number;
  currentStance?: DiplomaticStance | string;
}

export function useDiplomacyActionsRunner({
  targetName,
  targetNationId,
  nationId,
  senderGdp = 100000000000,
  targetGdp = 100000000000,
  currentStance = "NORMAL_DIPLOMACY",
}: UseDiplomacyActionsRunnerProps) {
  const { dispatchAction } = useGameActions();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    penalty: number;
    skippedSteps: number;
    pendingAction: () => Promise<void>;
  }>({
    isOpen: false,
    penalty: 0,
    skippedSteps: 0,
    pendingAction: async () => {},
  });

  const [feedbackModal, setFeedbackModal] =
    useState<DiplomaticProposalFeedback | null>(null);

  const foreignAidCost = useMemo(() => {
    return TreatyEvaluator.calculateForeignAidCost(senderGdp, targetGdp);
  }, [senderGdp, targetGdp]);

  const executeOrConfirm = (
    actionFn: () => Promise<void>,
    requiresBetrayalCheck: boolean,
  ) => {
    if (requiresBetrayalCheck) {
      const evaluation = DiplomaticBetrayalCalculator.calculatePenalty(
        currentStance as DiplomaticStance,
      );
      if (evaluation.hasBetrayed) {
        setConfirmModal({
          isOpen: true,
          penalty: evaluation.reputationPenalty,
          skippedSteps: evaluation.skippedSteps,
          pendingAction: actionFn,
        });
        return;
      }
    }
    actionFn();
  };

  const handleSendAid = async () => {
    const action = ActionFactory.sendForeignAid(nationId, targetNationId);
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handlePeaceTreaty = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "PEACE_TREATY",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleNonAggression = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "NON_AGGRESSION_PACT",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleAlliance = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "FULL_ALLIANCE",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleDeclareWar = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "DECLARE_WAR",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const acceptConfirmModal = async () => {
    const action = confirmModal.pendingAction;
    closeConfirmModal();
    await action();
  };

  return {
    confirmModal,
    feedbackModal,
    foreignAidCost,
    handleSendAid,
    handlePeaceTreaty: () => executeOrConfirm(handlePeaceTreaty, false),
    handleNonAggression: () => executeOrConfirm(handleNonAggression, false),
    handleAlliance: () => executeOrConfirm(handleAlliance, false),
    handleDeclareWar: () => executeOrConfirm(handleDeclareWar, true),
    closeConfirmModal,
    acceptConfirmModal,
    closeFeedbackModal: () => setFeedbackModal(null),
  };
}
