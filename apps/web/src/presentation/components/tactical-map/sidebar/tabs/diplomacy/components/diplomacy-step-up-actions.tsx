import React from "react";
import { useTranslations } from "next-intl";
import { ArrowUpCircle, Handshake, Coins, Clock } from "lucide-react";
import { DiplomaticStance, PersianNumberFormatter } from "@geopolitics/domain";

interface DiplomacyStepUpActionsProps {
  currentStance: DiplomaticStance | string;
  strategicPartnershipCost?: number;
  strategicPartnershipDividend?: number;
  canAffordPartnership?: boolean;
  isPeaceCooldownActive?: boolean;
  onPeaceTreaty: () => void;
  onNonAggression: () => void;
  onStrategicPartnership: () => void;
}

export function DiplomacyStepUpActions({
  currentStance,
  strategicPartnershipCost = 0,
  strategicPartnershipDividend = 0,
  canAffordPartnership = true,
  isPeaceCooldownActive = false,
  onPeaceTreaty,
  onNonAggression,
  onStrategicPartnership,
}: DiplomacyStepUpActionsProps) {
  const t = useTranslations("diplomacy");

  if (currentStance === "WAR") {
    return (
      <button
        onClick={onPeaceTreaty}
        className={`w-full p-3.5 rounded-2xl border text-right transition-all space-y-1 shadow-sm ${
          isPeaceCooldownActive
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 cursor-pointer"
            : "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-400 cursor-pointer"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-1.5">
            {isPeaceCooldownActive ? (
              <Clock size={16} />
            ) : (
              <Handshake size={16} />
            )}
            <span>{t("actions.enterPeaceTalks")}</span>
          </span>
          <ArrowUpCircle
            size={16}
            className={
              isPeaceCooldownActive ? "text-amber-400" : "text-emerald-400"
            }
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {isPeaceCooldownActive
            ? t("actions.peaceCooldownDesc")
            : t("actions.peaceActiveDesc")}
        </p>
      </button>
    );
  }

  if (currentStance === "NORMAL_DIPLOMACY") {
    return (
      <button
        onClick={onNonAggression}
        className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">
            {t("actions.proposeNonAggression")}
          </span>
          <ArrowUpCircle size={16} className="text-emerald-400" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {t("actions.proposeNonAggressionDesc")}
        </p>
      </button>
    );
  }

  if (currentStance === "NON_AGGRESSION_PACT") {
    return (
      <button
        onClick={onStrategicPartnership}
        disabled={!canAffordPartnership}
        className="w-full p-3.5 rounded-2xl bg-gdp/15 hover:bg-gdp/25 disabled:bg-secondary/40 disabled:opacity-60 border border-gdp/40 text-gdp text-right transition-all cursor-pointer space-y-1 shadow-sm font-sans"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-1.5">
            <Coins size={15} />
            <span>{t("actions.signStrategicPartnership")}</span>
          </span>
          <span className="text-[10px] font-mono font-bold bg-gdp/20 px-2 py-0.5 rounded-md text-gdp border border-gdp/30">
            {PersianNumberFormatter.formatCurrency(
              strategicPartnershipCost,
              true,
            )}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t("actions.signStrategicPartnershipDesc", {
            amount: PersianNumberFormatter.formatCurrency(
              strategicPartnershipDividend,
              true,
            ),
          })}
        </p>
      </button>
    );
  }

  return null;
}
