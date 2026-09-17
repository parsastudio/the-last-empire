import React from "react";
import { useTranslations } from "next-intl";
import {
  EconomicDoctrineStance,
  ALL_ECONOMIC_DOCTRINES,
} from "@geopolitics/domain";

interface EconomicDoctrineListSelectorProps {
  currentStance: EconomicDoctrineStance;
  selectedStance: EconomicDoctrineStance;
  onSelectStance: (stance: EconomicDoctrineStance) => void;
}

export function EconomicDoctrineListSelector({
  currentStance,
  selectedStance,
  onSelectStance,
}: EconomicDoctrineListSelectorProps) {
  const t = useTranslations("politics");

  return (
    <div className="grid grid-cols-1 gap-2 text-start font-sans">
      {ALL_ECONOMIC_DOCTRINES.map((stance) => {
        const isSelected = selectedStance === stance;
        const isEnacted = currentStance === stance;
        const name = t(`doctrines.${stance}.name`);
        const badge = t(`doctrines.${stance}.badge`);

        return (
          <button
            key={stance}
            type="button"
            onClick={() => onSelectStance(stance)}
            className={`w-full p-3 sm:p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
              isSelected
                ? "bg-secondary/90 border-primary shadow-md shadow-primary/10 ring-1 ring-primary/40 scale-[1.005]"
                : "bg-secondary/30 border-border/60 hover:bg-secondary/60 hover:border-border"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-black text-foreground truncate">
                {name}
              </span>
              {isEnacted && (
                <span className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md shrink-0">
                  {t("currentPolicyBadge")}
                </span>
              )}
            </div>

            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-muted-foreground bg-background/80 px-2.5 py-0.5 rounded-lg border border-border/50 shrink-0">
              {badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
