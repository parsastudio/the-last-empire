"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Ship, Anchor, Coins, Zap, Lock } from "lucide-react";
import {
  ActionFactory,
  NAVAL_FLEET_CONFIG,
  ProcurementBatchCalculator,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useFloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const t = useTranslations("military");
  const { formatCurrency, formatPercent, toDigits } = useLocaleFormatter();
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
  const revenuePercentText = formatPercent(
    Math.round(NAVAL_FLEET_CONFIG.TURN_REVENUE_RATE * 100),
  );

  const handleBuy = async () => {
    if (!canAfford || isSubmitting) return;

    triggerFeedback("fleet", `+${toDigits(batchInfo.batchQuantity)}`, {
      playSound: false,
    });

    const action = ActionFactory.buyNavalFleet(
      nationId,
      batchInfo.batchQuantity,
    );
    await dispatchAction(action);
  };

  const activeFeedbacks = getFeedbacksFor("fleet");

  return (
    <div className="relative p-4 sm:p-5 rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-card to-blue-950/25 space-y-3.5 font-sans text-start shadow-xl backdrop-blur-md ring-1 ring-white/5 overflow-hidden">
      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Ship size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-foreground">
                {t("navalFleetTitle")}
              </h4>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-lg">
                {t("navalFleetInStock", {
                  count: toDigits(navalFleetCount),
                })}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono block">
              {t("navalFleetPrice", {
                price: formatCurrency(fleetCost),
              })}
            </span>
          </div>
        </div>

        <div className="relative shrink-0 flex items-center">
          {activeFeedbacks.map((f) => (
            <span
              key={f.id}
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black font-mono text-cyan-400 drop-shadow-md animate-out fade-out slide-out-to-top-3 duration-500 pointer-events-none"
            >
              {f.text}
            </span>
          ))}

          {!hasSeaAccess ? (
            <div className="py-2.5 px-3.5 bg-secondary/80 text-muted-foreground rounded-2xl text-xs font-sans border border-border/60 flex items-center gap-1.5 shadow-inner">
              <Lock size={13} />
              <span>{t("navalNoSeaAccess")}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleBuy}
              disabled={!canAfford || isSubmitting}
              className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-40 text-white rounded-2xl text-xs font-black font-mono transition-all cursor-pointer shadow-lg shadow-cyan-600/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-cyan-400/40"
            >
              <Zap size={14} />
              <Coins size={13} />
              <span>
                {t("navalBuyInstant", {
                  cost: formatCurrency(batchInfo.batchCost),
                })}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-mono">
        <div className="bg-background/60 p-3 rounded-2xl border border-border/40 space-y-1">
          <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
            <Coins size={12} className="text-gdp" />
            <span>{t("navalRevenue", { pct: revenuePercentText })}</span>
          </span>
          <span className="font-black text-gdp text-xs block">
            +{formatCurrency(turnRevenue, true)} {t("perTurn")}
          </span>
        </div>

        <div className="bg-background/60 p-3 rounded-2xl border border-border/40 space-y-1">
          <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
            <Anchor size={12} className="text-cyan-400" />
            <span>{t("navalTransportCapacityPerFleet")}</span>
          </span>
          <span className="font-black text-cyan-300 text-xs block font-sans">
            {t("navalTransportRatio")}
          </span>
        </div>
      </div>
    </div>
  );
}
