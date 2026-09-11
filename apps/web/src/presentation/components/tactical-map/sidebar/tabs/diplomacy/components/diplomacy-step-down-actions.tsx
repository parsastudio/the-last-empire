import React from "react";
import { useTranslations } from "next-intl";
import { ArrowDownCircle, ShieldAlert } from "lucide-react";
import { DiplomaticStance } from "@geopolitics/domain";

interface DiplomacyStepDownActionsProps {
  currentStance: DiplomaticStance | string;
  canDeclareWar?: boolean;
  onCancelTreaty: () => void;
  onDeclareWar: () => void;
}

export function DiplomacyStepDownActions({
  currentStance,
  canDeclareWar = true,
  onCancelTreaty,
  onDeclareWar,
}: DiplomacyStepDownActionsProps) {
  const t = useTranslations("diplomacy");

  if (currentStance === "WAR") {
    return null;
  }

  if (currentStance === "NORMAL_DIPLOMACY") {
    return (
      <button
        onClick={onDeclareWar}
        disabled={!canDeclareWar}
        className={`w-full p-3 rounded-2xl border text-right transition-all space-y-0.5 ${
          !canDeclareWar
            ? "bg-secondary/40 border-border/60 text-muted-foreground opacity-50 cursor-not-allowed"
            : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 cursor-pointer"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold flex items-center gap-1.5">
            {!canDeclareWar && (
              <ShieldAlert size={14} className="text-muted-foreground" />
            )}
            <span>
              {!canDeclareWar
                ? t("actions.cannotDeclareWar")
                : t("actions.declareWar")}
            </span>
          </span>
          <ArrowDownCircle size={15} />
        </div>
      </button>
    );
  }

  if (currentStance === "NON_AGGRESSION_PACT") {
    return (
      <div className="space-y-2">
        <button
          onClick={onCancelTreaty}
          className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-right transition-all cursor-pointer space-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold">
              {t("actions.cancelNonAggression")}
            </span>
            <ArrowDownCircle size={15} className="text-amber-400" />
          </div>
        </button>
      </div>
    );
  }

  if (currentStance === "STRATEGIC_PARTNERSHIP") {
    return (
      <div className="space-y-2">
        <button
          onClick={onCancelTreaty}
          className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-right transition-all cursor-pointer space-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold">
              {t("actions.cancelPartnership")}
            </span>
            <ArrowDownCircle size={15} className="text-amber-400" />
          </div>
        </button>
      </div>
    );
  }

  return null;
}
