import { useState, useMemo } from "react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import {
  ActionFactory,
  DiplomaticStance,
  Nation,
  Province,
} from "@geopolitics/domain";
import {
  DiplomaticBetrayalCalculator,
  TreatyEvaluator,
  GeopoliticalVectorCalculator,
  UtilityDecisionEngine,
} from "@geopolitics/game-engine";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface UseDiplomacyActionsRunnerProps {
  targetName: string;
  targetNationId: string;
  nationId: string;
  senderGdp?: number;
  targetGdp?: number;
  currentStance?: DiplomaticStance | string;
  humanNation?: Nation | null;
  targetNation?: Nation | null;
  allNations?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
}

export function useDiplomacyActionsRunner({
  targetName,
  targetNationId,
  nationId,
  senderGdp = 100000000000,
  targetGdp = 100000000000,
  currentStance = "NORMAL_DIPLOMACY",
  humanNation,
  targetNation,
  allNations,
  provincesMap,
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

  const foreignAidCost = useMemo(() => {
    return TreatyEvaluator.calculateForeignAidCost(senderGdp, targetGdp);
  }, [senderGdp, targetGdp]);

  const vector = useMemo(() => {
    if (!humanNation || !targetNation) return null;
    return GeopoliticalVectorCalculator.calculate(
      targetNation,
      humanNation,
      allNations,
      provincesMap,
    );
  }, [humanNation, targetNation, allNations, provincesMap]);

  const allianceEvaluation = useMemo(() => {
    if (!vector || !targetNation || !humanNation) return null;
    return UtilityDecisionEngine.evaluateAcceptance(
      "FULL_ALLIANCE",
      targetNation,
      humanNation,
      vector,
    );
  }, [vector, targetNation, humanNation]);

  const napEvaluation = useMemo(() => {
    if (!vector || !targetNation || !humanNation) return null;
    return UtilityDecisionEngine.evaluateAcceptance(
      "NON_AGGRESSION_PACT",
      targetNation,
      humanNation,
      vector,
    );
  }, [vector, targetNation, humanNation]);

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
    const formattedCost = PersianNumberFormatter.formatCurrency(foreignAidCost);
    await dispatchAction(
      action,
      `بسته کمک مالی به ارزش ${formattedCost} به ${targetName} ارسال شد (+۲۵ همسویی، +۴ اعتبار جهانی).`,
    );
  };

  const handleNonAggression = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "NON_AGGRESSION_PACT",
    );
    await dispatchAction(
      action,
      `پیشنهاد پیمان عدم تخاصم به ${targetName} ابلاغ گردید (+۱۵ همسویی، +۱ اعتبار جهانی).`,
    );
  };

  const handleAlliance = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "FULL_ALLIANCE",
    );
    await dispatchAction(
      action,
      `پیشنهاد معاهده اتحاد کامل به ${targetName} ارسال گردید (+۳۰ همسویی، +۱ اعتبار جهانی).`,
    );
  };

  const handleDeclareWar = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "DECLARE_WAR",
    );
    await dispatchAction(
      action,
      `بیانیه رسمی اعلان جنگ به ${targetName} ابلاغ گردید (-۵ اعتبار جهانی).`,
    );
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
    foreignAidCost,
    allianceEvaluation,
    napEvaluation,
    handleSendAid,
    handleNonAggression: () => executeOrConfirm(handleNonAggression, false),
    handleAlliance: () => executeOrConfirm(handleAlliance, false),
    handleDeclareWar: () => executeOrConfirm(handleDeclareWar, true),
    closeConfirmModal,
    acceptConfirmModal,
  };
}
