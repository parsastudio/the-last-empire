import React from "react";
import { Zap } from "lucide-react";
import {
  ActionColorVariant,
  ActionVariantStyleUtility,
} from "./utils/action-variant-style.utility";

interface PercentageOption {
  pct: number;
  label?: string;
  isMax?: boolean;
}

interface PercentageSelectorProps {
  disabled?: boolean;
  options?: PercentageOption[];
  colorVariant?: ActionColorVariant;
  onSelect: (percentage: number) => void;
}

export function PercentageSelector({
  disabled = false,
  options = [
    { pct: 0.25, label: "۲۵٪" },
    { pct: 0.5, label: "۵۰٪" },
    { pct: 0.75, label: "۷۵٪" },
    { pct: 1.0, label: "۱۰۰٪ (حداکثر)", isMax: true },
  ],
  colorVariant = "gdp",
  onSelect,
}: PercentageSelectorProps) {
  const maxButtonClass = ActionVariantStyleUtility.getMaxButtonBg(colorVariant);

  return (
    <div className="grid grid-cols-4 gap-1.5 pt-1 font-sans dir-rtl">
      {options.map((opt) => {
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
              <span>{opt.label || "۱۰۰٪"}</span>
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
            {opt.label || `${opt.pct * 100}٪`}
          </button>
        );
      })}
    </div>
  );
}
