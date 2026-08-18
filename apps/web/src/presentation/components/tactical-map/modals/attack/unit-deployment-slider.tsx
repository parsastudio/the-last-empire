import React from "react";
import { LucideIcon } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

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

      <PercentageSelector
        disabled={availableCount === 0}
        onSelect={handlePercentageSelect}
        colorVariant="primary"
      />
    </div>
  );
}
