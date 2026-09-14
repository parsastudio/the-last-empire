import React from "react";
import { Zap } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import {
  ActionColorVariant,
  ActionVariantStyleUtility,
} from "./utils/action-variant-style.utility";

interface PercentageSelectorProps {
  disabled?: boolean;
  colorVariant?: ActionColorVariant;
  onSelect: (percentage: number) => void;
}

export function PercentageSelector({
  disabled = false,
  colorVariant = "gdp",
  onSelect,
}: PercentageSelectorProps) {
  const { formatPercent } = useLocaleFormatter();
  const maxButtonClass = ActionVariantStyleUtility.getMaxButtonBg(colorVariant);

  const defaultOptions = [
    { pct: 0.25, label: formatPercent(25) },
    { pct: 0.5, label: formatPercent(50) },
    { pct: 0.75, label: formatPercent(75) },
    { pct: 1.0, label: `${formatPercent(100)}`, isMax: true },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5 pt-1 font-sans">
      {defaultOptions.map((opt) => {
        if (opt.isMax) {
          return (
            <button
              key={opt.pct}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.pct)}
              className={`py-1 rounded-lg border text-[9px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-30 ${maxButtonClass}`}
            >
              <Zap size={10} />
              <span>{opt.label || formatPercent(100)}</span>
            </button>
          );
        }

        return (
          <button
            key={opt.pct}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.pct)}
            className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            {opt.label || formatPercent(opt.pct * 100)}
          </button>
        );
      })}
    </div>
  );
}
