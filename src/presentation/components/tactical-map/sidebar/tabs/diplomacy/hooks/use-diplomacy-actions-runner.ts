import { useState, useMemo } from "react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import {
  DiplomaticBetrayalCalculator,
  TreatyEvaluator,
} from "@/engine/diplomacy/diplomacy-engine";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface UseDiplomacyActionsRunnerProps {
  targetName: string;
  targetNationId: string;
  nationId: string;
  targetGdp?: number;
  currentStance?: DiplomaticStance | string;
}

export function useDiplomacyActionsRunner({
  targetName,
  targetNationId,
  nationId,
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

  const foreignAidCost = useMemo(() => {
    return TreatyEvaluator.calculateForeignAidCost(targetGdp);
  }, [targetGdp]);

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
      `بسته کمک مالی به ارزش ${formattedCost} به ${targetName} ارسال شد (+۲۵ دیدگاه، +۴ اعتبار جهانی).`,
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
      `پیشنهاد پیمان عدم تخاصم به ${targetName} ابلاغ گردید (+۱۵ دیدگاه، +۳ اعتبار جهانی).`,
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
      `پیشنهاد معاهده اتحاد کامل به ${targetName} ارسال گردید (+۳۰ دیدگاه، +۶ اعتبار جهانی).`,
    );
  };

  const handleSeverTrade = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "SEVER_TRADE_RELATIONS",
    );
    await dispatchAction(
      action,
      `قطع روابط تجاری و تحریم اقتصادی علیه ${targetName} اعمال گردید.`,
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
      `بیانیه رسمی اعلان جنگ به ${targetName} ابلاغ گردید (-۱۰ اعتبار جهانی).`,
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
    handleSendAid,
    handleNonAggression: () => executeOrConfirm(handleNonAggression, false),
    handleAlliance: () => executeOrConfirm(handleAlliance, false),
    handleSeverTrade,
    handleDeclareWar: () => executeOrConfirm(handleDeclareWar, true),
    closeConfirmModal,
    acceptConfirmModal,
  };
}
