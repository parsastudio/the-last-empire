import React, { useState } from "react";
import {
  Handshake,
  CheckCircle2,
  Flame,
  Ban,
  Swords,
  Globe,
} from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomatic-betrayal-calculator";
import { BetrayalConfirmModal } from "./betrayal-confirm-modal";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

interface AdvancedDiplomacyActionsProps {
  targetName: string;
  targetNationId?: string;
  nationId?: string;
  currentStance?: DiplomaticStance | string;
  isTradeEmbargoed?: boolean;
  isLandNeighbor?: boolean;
  onOpenProxyModal?: () => void;
}

export function AdvancedDiplomacyActions({
  targetName,
  targetNationId = "NATION_15",
  nationId = "NATION_118",
  currentStance = "NORMAL_DIPLOMACY",
  isTradeEmbargoed = false,
  isLandNeighbor = false,
  onOpenProxyModal,
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

  const handleNonAggression = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "NON_AGGRESSION_PACT",
    );
    await dispatchAction(
      action,
      `پیشنهاد پیمان عدم تخاصم به ${targetName} ابلاغ گردید.`,
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
      `پیشنهاد معاهده دفاعی مشترک به ${targetName} ارسال گردید.`,
    );
  };

  const handleInitiateBattle = async () => {
    const action = ActionFactory.initiateBattle(nationId, targetNationId, 0);
    await dispatchAction(
      action,
      `فرمان آغاز عملیات نظامی علیه ${targetName} صادر شد.`,
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

  return (
    <>
      <div className="space-y-2.5 dir-rtl text-right">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          گزینه‌های تعامل و وضعیت سیاسی دوجانبه
        </span>

        <div className="space-y-2">
          {isAlliance ? (
            <div className="w-full p-3 rounded-xl bg-gdp/15 border border-gdp/40 text-gdp flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                اتحاد نظامی کامل (فعال)
              </span>
              <span className="text-[9px] font-mono bg-gdp/20 px-2 py-0.5 rounded text-gdp">
                وضعیت فعلی
              </span>
            </div>
          ) : (
            <button
              onClick={() => executeOrConfirm(handleAlliance, false)}
              className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  پیشنهاد اتحاد نظامی کامل
                </span>
                <CheckCircle2 size={13} className="text-gdp" />
              </div>
            </button>
          )}

          {isNonAggression ? (
            <div className="w-full p-3 rounded-xl bg-treasury/15 border border-treasury/40 text-treasury flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Handshake size={14} />
                پیمان عدم تخاصم (فعال)
              </span>
              <span className="text-[9px] font-mono bg-treasury/20 px-2 py-0.5 rounded text-treasury">
                وضعیت فعلی
              </span>
            </div>
          ) : (
            <button
              onClick={() => executeOrConfirm(handleNonAggression, false)}
              className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  پیشنهاد پیمان عدم تخاصم
                </span>
                <Handshake size={13} className="text-treasury" />
              </div>
            </button>
          )}

          {isNormal ? (
            <div className="w-full p-3 rounded-xl bg-secondary/60 border border-border/60 text-muted-foreground flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Globe size={14} />
                وضعیت پایه و دیپلماسی عادی (فعال)
              </span>
              <span className="text-[9px] font-mono bg-background px-2 py-0.5 rounded text-muted-foreground">
                وضعیت فعلی
              </span>
            </div>
          ) : null}

          <button
            onClick={() => executeOrConfirm(handleInitiateBattle, true)}
            disabled={!isLandNeighbor && !isWar}
            className={`w-full p-3 rounded-xl border text-right transition-all space-y-1 ${
              isWar
                ? "bg-rose-600/20 border-rose-500/40 text-rose-500 font-bold cursor-pointer"
                : isLandNeighbor
                  ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-500 cursor-pointer"
                  : "bg-secondary/40 border-border/40 text-muted-foreground opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">
                {isWar
                  ? "در حال نبرد نظامی فعال"
                  : isLandNeighbor
                    ? "اعلان نبرد و تهاجم مستقیم زمینی"
                    : "نیازمند مرز خاکی مشترک برای تهاجم زمینی"}
              </span>
              <Swords size={13} />
            </div>
            {!isWar && (
              <p className="text-[9px] text-muted-foreground">
                {isLandNeighbor
                  ? "ورود به فاز اقدام نظامی مستقیم علیه قلمرو این کشور."
                  : "تنها امکان تهاجم به کشورهایی وجود دارد که دارای مرز زمینی مستقیم با کشور شما هستند."}
              </p>
            )}
          </button>

          <button
            onClick={handleSeverTrade}
            disabled={isSevered || isWar}
            className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer space-y-1 ${
              isSevered
                ? "bg-rose-500/10 border-rose-500/30 text-rose-500 opacity-60 cursor-not-allowed"
                : "bg-secondary hover:bg-secondary/80 border-border text-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">
                {isSevered
                  ? "روابط تجاری قطع است"
                  : "قطع روابط تجاری و تحریم اقتصادی"}
              </span>
              <Ban size={13} className="text-rose-500" />
            </div>
          </button>

          <button
            onClick={() => {
              if (onOpenProxyModal) {
                onOpenProxyModal();
              }
            }}
            className="w-full p-3 rounded-xl bg-military/10 hover:bg-military/20 border border-military/30 text-right transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-military">
                راه‌اندازی عملیات و جنگ نیابتی
              </span>
              <Flame size={13} className="text-military" />
            </div>
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
