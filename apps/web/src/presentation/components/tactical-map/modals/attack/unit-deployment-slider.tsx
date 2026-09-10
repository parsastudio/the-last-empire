import React from "react";
import { LucideIcon } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

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
    TacticalSound.playSliderTick();
    const target = Math.floor(availableCount * pct);
    onChange(target);
  };

  const clampedCount = Math.min(availableCount, Math.max(0, selectedCount));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    TacticalSound.playSliderTick();
    onChange(Number(e.target.value));
  };

  return (
    <div className="bg-secondary/40 border border-border/70 p-4 rounded-3xl space-y-3 font-sans dir-rtl text-right hover:border-primary/40 transition-all shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-secondary/80 border border-border/60">
            <Icon size={16} className={iconColorClass} />
          </div>
          <span className="font-black text-foreground text-xs">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] bg-background/60 border border-border/50 px-2.5 py-1 rounded-xl">
          <span className="font-extrabold text-foreground text-xs">
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
        onChange={handleSliderChange}
        className="w-full accent-primary cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30"
      />

      <PercentageSelector
        disabled={availableCount === 0}
        onSelect={handlePercentageSelect}
        colorVariant="primary"
      />
    </div>
  );
}
