"use client";

import React, { useMemo } from "react";
import { Ship, Anchor, Coins, ShieldCheck, Zap, Lock } from "lucide-react";
import {
  PersianNumberFormatter,
  ActionFactory,
  NAVAL_FLEET_CONFIG,
  ProcurementBatchCalculator,
} from "@geopolitics/domain";
import { NavalDeploymentClamper } from "@geopolitics/game-engine";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useFloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";

interface NavalFleetProcurementCardProps {
  nationId: string;
  treasury: number;
  navalFleetCount: number;
  hasSeaAccess: boolean;
}

export function NavalFleetProcurementCard({
  nationId,
  treasury,
  navalFleetCount,
  hasSeaAccess,
}: NavalFleetProcurementCardProps) {
  const { dispatchAction, isSubmitting } = useGameActions();
  const { triggerFeedback, getFeedbacksFor } = useFloatingFeedback<string>();

  const fleetCost = NAVAL_FLEET_CONFIG.FLEET_UNIT_COST;

  const batchInfo = useMemo(() => {
    return ProcurementBatchCalculator.calculateBatch({
      treasury,
      baselineTreasury: treasury,
      budgetPercentage: 0.1,
      unitPrice: fleetCost,
      baseValuationPrice: fleetCost,
      remainingQuotaRoom: 999,
      remainingValuationCapacity: Number.MAX_SAFE_INTEGER,
      minQuantity: 1,
    });
  }, [treasury, fleetCost]);

  const canAfford = hasSeaAccess && batchInfo.canAfford;
  const turnRevenue = Math.floor(
    navalFleetCount * fleetCost * NAVAL_FLEET_CONFIG.TURN_REVENUE_RATE,
  );
  const revenuePercentText = PersianNumberFormatter.toPersianDigits(
    Math.round(NAVAL_FLEET_CONFIG.TURN_REVENUE_RATE * 100),
  );

  const totalTransportCapacity = NavalDeploymentClamper.calculateMaxCapacity(
    "NAVAL",
    navalFleetCount,
  );

  const handleBuy = async () => {
    if (!canAfford || isSubmitting) return;

    triggerFeedback(
      "fleet",
      `+${PersianNumberFormatter.toPersianDigits(batchInfo.batchQuantity)} ناوگان`,
      { playSound: false },
    );

    const action = ActionFactory.buyNavalFleet(
      nationId,
      batchInfo.batchQuantity,
    );
    await dispatchAction(action);
  };

  const activeFeedbacks = getFeedbacksFor("fleet");

  return (
    <div className="relative p-4 rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-card to-blue-950/25 space-y-3 font-sans dir-rtl text-right shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Ship size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-foreground">
                ناوگان راهبردی دریایی (Naval Fleet)
              </h4>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-lg">
                موجودی:{" "}
                {PersianNumberFormatter.toPersianDigits(navalFleetCount)} فروند
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono block">
              قیمت واحد: {PersianNumberFormatter.formatCurrency(fleetCost)} •
              بدون هزینه نگهداری
            </span>
          </div>
        </div>

        <div className="relative shrink-0">
          {activeFeedbacks.map((f) => (
            <span
              key={f.id}
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black font-mono text-cyan-400 drop-shadow-md animate-out fade-out slide-out-to-top-3 duration-500 pointer-events-none"
            >
              {f.text}
            </span>
          ))}

          {!hasSeaAccess ? (
            <div className="py-2 px-3 bg-secondary/80 text-muted-foreground rounded-xl text-[10px] font-sans border border-border/60 flex items-center gap-1">
              <Lock size={12} />
              <span>فاقد مرز دریایی</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleBuy}
              disabled={!canAfford || isSubmitting}
              className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-40 text-white rounded-xl text-xs font-black font-mono transition-all cursor-pointer shadow-md shadow-cyan-600/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 border border-cyan-400/40"
            >
              <Zap size={13} />
              <Coins size={12} />
              <span>
                خرید فوری (
                {PersianNumberFormatter.formatCurrency(batchInfo.batchCost)})
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        <div className="bg-background/60 p-2.5 rounded-2xl border border-border/40 space-y-0.5">
          <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
            <Coins size={11} className="text-gdp" />
            درآمد امنیت بین‌المللی ({revenuePercentText}٪):
          </span>
          <span className="font-extrabold text-gdp text-xs block">
            +{PersianNumberFormatter.formatCurrency(turnRevenue, true)} / نوبت
          </span>
        </div>

        <div className="bg-background/60 p-2.5 rounded-2xl border border-border/40 space-y-0.5">
          <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
            <Anchor size={11} className="text-cyan-400" />
            ظرفیت ترابری هر ناوگان:
          </span>
          <span className="font-extrabold text-cyan-300 text-xs block font-sans">
            ۶۰ پیاده‌نظام یا ۱۵ تانک
          </span>
        </div>

        <div className="bg-background/60 p-2.5 rounded-2xl border border-border/40 space-y-0.5">
          <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
            <ShieldCheck size={11} className="text-primary" />
            کل ظرفیت ترابری دریایی:
          </span>
          <span className="font-extrabold text-foreground text-xs block">
            {PersianNumberFormatter.toPersianDigits(totalTransportCapacity)}{" "}
            یگان ظرفیت
          </span>
        </div>
      </div>
    </div>
  );
}
