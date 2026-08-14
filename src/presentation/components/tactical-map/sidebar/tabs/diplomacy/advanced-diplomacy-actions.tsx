import React, { useState, useMemo } from "react";
import {
  Handshake,
  CheckCircle2,
  Ban,
  Swords,
  HeartHandshake,
  Binary,
} from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import {
  DiplomaticBetrayalCalculator,
  TreatyEvaluator,
} from "@/engine/diplomacy/diplomacy-engine";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { BetrayalConfirmModal } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/betrayal-confirm-modal";
import { TreatyStatusBanner } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/treaty-status-banner";

interface AdvancedDiplomacyActionsProps {
  targetName: string;
  targetNationId: string;
  nationId: string;
  targetGdp?: number;
  currentStance?: DiplomaticStance | string;
  isTradeEmbargoed?: boolean;
  onOpenProxy?: () => void;
}

export function AdvancedDiplomacyActions({
  targetName,
  targetNationId,
  nationId,
  targetGdp = 100000000000,
  currentStance = "NORMAL_DIPLOMACY",
  isTradeEmbargoed = false,
  onOpenProxy,
}: AdvancedDiplomacyActionsProps) {
  const { dispatchAction } = useGameActions();
  const betrayalCalculator = useMemo(
    () => new DiplomaticBetrayalCalculator(),
    [],
  );

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

  const isWar = currentStance === "WAR";
  const isSevered = currentStance === "SEVERED_RELATIONS" || isTradeEmbargoed;
  const isAlliance = currentStance === "ALLIANCE";
  const isNonAggression = currentStance === "NON_AGGRESSION_PACT";

  const executeOrConfirm = (
    actionFn: () => Promise<void>,
    requiresBetrayalCheck: boolean,
  ) => {
    if (requiresBetrayalCheck) {
      const evaluation = betrayalCalculator.calculatePenalty(
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
      `بسته کمک مالی به ارزش ${formattedCost} به ${targetName} ارسال شد (+۲۰ دیدگاه، +۴ اعتبار جهانی).`,
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

  return (
    <>
      <div className="space-y-4 dir-rtl text-right">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            وضعیت‌های سیاسی و معاهدات دوجانبه
          </span>

          <div className="space-y-2">
            <TreatyStatusBanner
              stance={currentStance}
              isTradeEmbargoed={isTradeEmbargoed}
            />

            {!isWar && (
              <button
                onClick={handleSendAid}
                className="w-full p-3 rounded-xl bg-gdp/15 hover:bg-gdp/25 border border-gdp/30 text-right transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gdp">
                    ارسال کمک مالی و دیپلماتیک (
                    {PersianNumberFormatter.formatCurrency(foreignAidCost)})
                  </span>
                  <HeartHandshake size={14} className="text-gdp" />
                </div>
                <p className="text-[10px] text-muted-foreground font-sans">
                  بهبود فوری ۲۰+ دیدگاه دوجانبه و ۴+ اعتبار جهانی برای کشور شما
                </p>
              </button>
            )}

            {!isNonAggression && (
              <button
                onClick={() => executeOrConfirm(handleNonAggression, false)}
                disabled={isWar || isSevered}
                className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 border border-border text-right transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    پیمان عدم تخاصم
                  </span>
                  <Handshake size={13} className="text-treasury" />
                </div>
              </button>
            )}

            {!isAlliance && (
              <button
                onClick={() => executeOrConfirm(handleAlliance, false)}
                disabled={isWar || isSevered}
                className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 border border-border text-right transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    پیمان اتحاد کامل
                  </span>
                  <CheckCircle2 size={13} className="text-gdp" />
                </div>
              </button>
            )}

            {!isSevered && !isWar && (
              <button
                onClick={handleSeverTrade}
                className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    قطع روابط تجاری
                  </span>
                  <Ban size={13} className="text-rose-400" />
                </div>
              </button>
            )}

            {!isWar && (
              <button
                onClick={() => executeOrConfirm(handleDeclareWar, true)}
                className="w-full p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-right transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">اعلان جنگ رسمی</span>
                  <Swords size={13} />
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border/60 space-y-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider font-mono block">
            دایره عملیات ویژه اطلاعاتی و سیاه
          </span>

          <button
            onClick={() => {
              if (onOpenProxy) {
                onOpenProxy();
              }
            }}
            className="w-full p-3.5 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/80 text-right transition-all cursor-pointer space-y-1 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-primary">
                ورود به دایره جاسوسی و خرابکاری در {targetName}
              </span>
              <Binary size={14} className="text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              اجرای شنود ماهواره‌ای، انهدام پدافند هوایی و سرقت مستقیم اسرار و
              فناوری‌های راهبردی.
            </p>
          </button>
        </div>
      </div>

      <BetrayalConfirmModal
        isOpen={confirmModal.isOpen}
        targetName={targetName}
        penalty={confirmModal.penalty}
        skippedSteps={confirmModal.skippedSteps}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await confirmModal.pendingAction();
        }}
      />
    </>
  );
}
