import React from "react";
import { Zap } from "lucide-react";

interface PercentageOption {
  pct: number;
  label?: string;
  isMax?: boolean;
}

interface PercentageSelectorProps {
  disabled?: boolean;
  options?: PercentageOption[];
  colorVariant?: "primary" | "gdp" | "military" | "treasury";
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
  const getMaxButtonColor = () => {
    switch (colorVariant) {
      case "military":
        return "bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-500";
      case "primary":
        return "bg-primary/20 hover:bg-primary/30 border-primary/40 text-primary";
      case "treasury":
        return "bg-treasury/20 hover:bg-treasury/30 border-treasury/40 text-treasury";
      case "gdp":
      default:
        return "bg-gdp/20 hover:bg-gdp/30 border-gdp/40 text-gdp";
    }
  };

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
              className={`py-1 rounded-lg border text-[9px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-30 ${getMaxButtonColor()}`}
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
