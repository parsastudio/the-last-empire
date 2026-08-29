import React from "react";
import { ArrowDownCircle } from "lucide-react";
import { DiplomaticStance } from "@geopolitics/domain";

interface DiplomacyStepDownActionsProps {
  currentStance: DiplomaticStance | string;
  onCancelTreaty: () => void;
  onDeclareWar: () => void;
}

export function DiplomacyStepDownActions({
  currentStance,
  onCancelTreaty,
  onDeclareWar,
}: DiplomacyStepDownActionsProps) {
  if (currentStance === "WAR") {
    return null;
  }

  if (currentStance === "NORMAL_DIPLOMACY") {
    return (
      <button
        onClick={onDeclareWar}
        className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-right transition-all cursor-pointer space-y-0.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold">
            اعلان جنگ رسمی (قطع روابط و گسیل ارتش)
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
              لغو پیمان عدم تخاصم (گام رو به پایین: دیپلماسی عادی)
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
              لغو شراکت استراتژیک (گام رو به پایین: پیمان عدم تخاصم)
            </span>
            <ArrowDownCircle size={15} className="text-amber-400" />
          </div>
        </button>
      </div>
    );
  }

  return null;
}
