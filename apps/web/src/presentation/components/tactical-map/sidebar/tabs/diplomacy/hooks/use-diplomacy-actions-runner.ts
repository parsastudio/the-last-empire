import { useState, useMemo } from "react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import {
  ActionFactory,
  DiplomaticStance,
  SecurityGuaranteeValidator,
  SecurityGuaranteeValidationResult,
  Province,
  Nation,
} from "@geopolitics/domain";
import {
  DiplomaticBetrayalCalculator,
  TreatyEvaluator,
} from "@geopolitics/game-engine";
import { DiplomaticProposalFeedback } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/diplomatic-feedback-modal";
import { useUiStore } from "@/presentation/stores/use-ui-store";

const DEFAULT_INVALID_GUARANTEE: SecurityGuaranteeValidationResult = {
  isValid: false,
  reason: "اطلاعات کشور در دسترس نیست.",
  gdpRatio: 1,
  techDiff: 0,
  tension: 0,
  isGdpValid: false,
  isTechValid: false,
  isTensionValid: false,
  isNotWar: false,
};

interface UseDiplomacyActionsRunnerProps {
  targetNationId: string;
  nationId: string;
  senderGdp?: number;
  targetGdp?: number;
  currentStance?: DiplomaticStance | string;
  provincesMap?: Record<string, Province>;
  clientNation?: Nation | null;
  targetNation?: Nation | null;
}

export function useDiplomacyActionsRunner({
  targetNationId,
  nationId,
  senderGdp = 100000000000,
  targetGdp = 100000000000,
  currentStance = "NORMAL_DIPLOMACY",
  provincesMap,
  clientNation,
  targetNation,
}: UseDiplomacyActionsRunnerProps) {
  const { dispatchAction } = useGameActions();
  const openModal = useUiStore((state) => state.openModal);

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

  const securityGuaranteeCost = useMemo(() => {
    return Math.floor(senderGdp * 0.1);
  }, [senderGdp]);

  const emergencyProtectorateCost = useMemo(() => {
    return Math.floor(senderGdp * 0.3);
  }, [senderGdp]);

  const guaranteeValidation = useMemo<SecurityGuaranteeValidationResult>(() => {
    if (!clientNation || !targetNation) {
      return DEFAULT_INVALID_GUARANTEE;
    }
    return SecurityGuaranteeValidator.validate(
      clientNation,
      targetNation,
      provincesMap,
      false,
    );
  }, [clientNation, targetNation, provincesMap]);

  const emergencyValidation = useMemo<SecurityGuaranteeValidationResult>(() => {
    if (!clientNation || !targetNation) {
      return DEFAULT_INVALID_GUARANTEE;
    }
    return SecurityGuaranteeValidator.validate(
      clientNation,
      targetNation,
      provincesMap,
      true,
    );
  }, [clientNation, targetNation, provincesMap]);

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

  const handleOpenPeaceNegotiations = () => {
    openModal({
      type: "PEACE_NEGOTIATION",
      targetNationId,
    });
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

  const handleStrategicPartnership = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "STRATEGIC_PARTNERSHIP",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleSecurityGuarantee = async () => {
    if (!guaranteeValidation.isValid) return;
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "SECURITY_GUARANTEE",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleEmergencyProtectorate = async () => {
    if (!emergencyValidation.isValid) return;
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "EMERGENCY_PROTECTORATE",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleCancelSecurityGuarantee = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "CANCEL_SECURITY_GUARANTEE",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleCancelEmergencyProtectorate = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "CANCEL_EMERGENCY_PROTECTORATE",
    );
    const res = await dispatchAction(action);
    if (res.success && res.resultData) {
      setFeedbackModal(res.resultData as DiplomaticProposalFeedback);
    }
  };

  const handleCancelTreaty = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "CANCEL_TREATY",
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
    securityGuaranteeCost,
    emergencyProtectorateCost,
    guaranteeValidation,
    emergencyValidation,
    handleSendAid,
    handlePeaceTreaty: handleOpenPeaceNegotiations,
    handleNonAggression: () => executeOrConfirm(handleNonAggression, false),
    handleStrategicPartnership: () =>
      executeOrConfirm(handleStrategicPartnership, false),
    handleSecurityGuarantee,
    handleEmergencyProtectorate,
    handleCancelSecurityGuarantee,
    handleCancelEmergencyProtectorate,
    handleCancelTreaty: () => executeOrConfirm(handleCancelTreaty, false),
    handleDeclareWar: () => executeOrConfirm(handleDeclareWar, true),
    closeConfirmModal,
    acceptConfirmModal,
    closeFeedbackModal: () => setFeedbackModal(null),
  };
}
