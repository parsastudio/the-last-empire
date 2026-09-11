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
    <div className="grid grid-cols-1 gap-2">
      {ALL_ECONOMIC_DOCTRINES.map((stance) => {
        const isSelected = selectedStance === stance;
        const isEnacted = currentStance === stance;
        const name = t(`doctrines.${stance}.name`);
        const badge = t(`doctrines.${stance}.badge`);
        const description = t(`doctrines.${stance}.description`);

        return (
          <button
            key={stance}
            type="button"
            onClick={() => onSelectStance(stance)}
            className={`w-full p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1.5 ${
              isSelected
                ? "bg-secondary/90 border-primary shadow-md shadow-primary/10 ring-1 ring-primary/40"
                : "bg-secondary/30 border-border/60 hover:bg-secondary/60 hover:border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-foreground">
                  {name}
                </span>
                {isEnacted && (
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                    {t("currentPolicyBadge")}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md border border-border/50">
                {badge}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
