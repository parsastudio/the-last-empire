import React, { useState } from "react";
import {
  Handshake,
  CheckCircle2,
  Ban,
  Swords,
  Globe,
  ShieldAlert,
  AlertTriangle,
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
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

function BetrayalConfirmModal({
  isOpen,
  targetName,
  penalty,
  skippedSteps,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  targetName: string;
  penalty: number;
  skippedSteps: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="هشدار لغو یکباره تعهدات دیپلماتیک"
      subtitle={`عدم رعایت گام‌به‌گام مراحل دیپلماتیک با ${targetName}`}
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl flex items-start gap-3">
          <ShieldAlert size={20} className="text-military shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-military block">
              جریمه نادیده گرفتن{" "}
              {PersianNumberFormatter.toPersianDigits(skippedSteps)} گام
              دیپلماتیک
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              شما بدون طی کردن مراحل قانونی دیپلماتیک قصد اقدام مستقیم دارید.
              این رفتار غافلگیرانه باعث واکنش جامعه جهانی خواهد شد.
            </p>
          </div>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-sans text-[11px]">
              میزان کسر اعتبار و پرستیژ جهانی:
            </span>
            <span className="font-bold text-military text-sm">
              -{PersianNumberFormatter.toPersianDigits(penalty)} امتیاز
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onClose}
            className="py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl text-xs font-bold transition-all border border-border cursor-pointer"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            className="py-3 bg-military hover:bg-military/90 text-primary-foreground rounded-2xl text-xs font-bold transition-all shadow-lg shadow-military/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <AlertTriangle size={14} />
            <span>تایید و ریسک جریمه</span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}

interface AdvancedDiplomacyActionsProps {
  targetName: string;
  targetNationId: string;
  nationId: string;
  currentStance?: DiplomaticStance | string;
  isTradeEmbargoed?: boolean;
  onOpenProxy?: () => void;
}

export function AdvancedDiplomacyActions({
  targetName,
  targetNationId,
  nationId,
  currentStance = "NORMAL_DIPLOMACY",
  isTradeEmbargoed = false,
  onOpenProxy,
}: AdvancedDiplomacyActionsProps) {
  const { dispatchAction } = useGameActions();
  const betrayalCalculator = new DiplomaticBetrayalCalculator();

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

  const isWar = currentStance === "WAR";
  const isSevered = currentStance === "SEVERED_RELATIONS" || isTradeEmbargoed;
  const isAlliance = currentStance === "ALLIANCE";
  const isNonAggression = currentStance === "NON_AGGRESSION_PACT";
  const isNormal =
    currentStance === "NORMAL_DIPLOMACY" ||
    (!isWar && !isSevered && !isAlliance && !isNonAggression);

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
    await dispatchAction(
      action,
      `بسته کمک مالی و بشردوستانه ۵ میلیارد دلاری به ${targetName} ارسال شد (+۲۰ دیدگاه، +۴ اعتبار جهانی).`,
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
            {isWar ? (
              <div className="w-full p-3 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Swords size={14} />
                  در حال نبرد نظامی فعال (متخاصم)
                </span>
                <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-400">
                  وضعیت فعلی
                </span>
              </div>
            ) : isAlliance ? (
              <div className="w-full p-3 rounded-xl bg-gdp/15 border border-gdp/40 text-gdp flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  اتحاد نظامی کامل (فعال)
                </span>
                <span className="text-[9px] font-mono bg-gdp/20 px-2 py-0.5 rounded text-gdp">
                  وضعیت فعلی
                </span>
              </div>
            ) : isNonAggression ? (
              <div className="w-full p-3 rounded-xl bg-treasury/15 border border-treasury/40 text-treasury flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Handshake size={14} />
                  پیمان عدم تخاصم (فعال)
                </span>
                <span className="text-[9px] font-mono bg-treasury/20 px-2 py-0.5 rounded text-treasury">
                  وضعیت فعلی
                </span>
              </div>
            ) : isSevered ? (
              <div className="w-full p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Ban size={14} />
                  قطع روابط تجاری و تحریم (فعال)
                </span>
                <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-400">
                  وضعیت فعلی
                </span>
              </div>
            ) : isNormal ? (
              <div className="w-full p-3 rounded-xl bg-secondary/60 border border-border/60 text-muted-foreground flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Globe size={14} />
                  دیپلماسی عادی و بی‌طرف (فعال)
                </span>
                <span className="text-[9px] font-mono bg-background px-2 py-0.5 rounded text-muted-foreground">
                  وضعیت فعلی
                </span>
              </div>
            ) : null}

            {!isWar && (
              <button
                onClick={handleSendAid}
                className="w-full p-3 rounded-xl bg-gdp/15 hover:bg-gdp/25 border border-gdp/30 text-right transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gdp">
                    ارسال کمک مالی و دیپلماتیک (۵ میلیارد دلار)
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
