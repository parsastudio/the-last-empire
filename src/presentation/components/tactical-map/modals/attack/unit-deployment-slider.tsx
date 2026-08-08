import React from "react";
import { LucideIcon } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface UnitDeploymentSliderProps {
  label: string;
  unitName: string;
  icon: LucideIcon;
  iconColorClass: string;
  availableCount: number;
  selectedCount: number;
  onChange: (value: number) => void;
}

export function UnitDeploymentSlider({
  label,
  unitName,
  icon: Icon,
  iconColorClass,
  availableCount,
  selectedCount,
  onChange,
}: UnitDeploymentSliderProps) {
  const handlePercentageSelect = (pct: number) => {
    if (availableCount <= 0) return;
    const target = Math.floor(availableCount * pct);
    onChange(target);
  };

  const clampedCount = Math.min(availableCount, Math.max(0, selectedCount));

  return (
    <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2.5 font-sans dir-rtl text-right">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Icon size={15} className={iconColorClass} />
          <span className="font-bold text-foreground">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="font-extrabold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              clampedCount.toLocaleString("en-US"),
            )}
          </span>
          <span className="text-muted-foreground text-[10px]">
            از{" "}
            {PersianNumberFormatter.toPersianDigits(
              availableCount.toLocaleString("en-US"),
            )}{" "}
            {unitName}
          </span>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={Math.max(0, availableCount)}
        disabled={availableCount === 0}
        value={clampedCount}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer h-1.5 bg-secondary rounded-lg disabled:opacity-30"
      />

      <div className="grid grid-cols-4 gap-1 pt-0.5">
        <button
          type="button"
          disabled={availableCount === 0}
          onClick={() => handlePercentageSelect(0.25)}
          className="py-1 bg-secondary/80 hover:bg-secondary border border-border/40 rounded-lg text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
        >
          ۲۵٪
        </button>
        <button
          type="button"
          disabled={availableCount === 0}
          onClick={() => handlePercentageSelect(0.5)}
          className="py-1 bg-secondary/80 hover:bg-secondary border border-border/40 rounded-lg text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
        >
          ۵۰٪
        </button>
        <button
          type="button"
          disabled={availableCount === 0}
          onClick={() => handlePercentageSelect(0.75)}
          className="py-1 bg-secondary/80 hover:bg-secondary border border-border/40 rounded-lg text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
        >
          ۷۵٪
        </button>
        <button
          type="button"
          disabled={availableCount === 0}
          onClick={() => handlePercentageSelect(1.0)}
          className="py-1 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-lg text-[9px] font-mono font-bold text-primary transition-all cursor-pointer disabled:opacity-30"
        >
          ۱۰۰٪ (کل)
        </button>
      </div>
    </div>
  );
}
