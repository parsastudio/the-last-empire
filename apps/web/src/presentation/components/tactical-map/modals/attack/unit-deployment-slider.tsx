import React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("attack.slider");

  const handlePercentageSelect = (pct: number) => {
    if (availableCount <= 0) return;
    TacticalSound.playSliderTick();
    const target = Math.floor(availableCount * pct);
    onChange(target);
  };

  const clampedCount = Math.min(availableCount, Math.max(0, selectedCount));
  const fillRatio =
    availableCount > 0 ? (clampedCount / availableCount) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    TacticalSound.playSliderTick();
    onChange(Number(e.target.value));
  };

  return (
    <div className="bg-secondary/40 border border-border/70 p-2.5 md:p-4 rounded-2xl md:rounded-3xl space-y-2 md:space-y-3 font-sans dir-rtl text-right hover:border-primary/40 transition-all shadow-md backdrop-blur-xl relative overflow-hidden group">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 md:gap-2.5">
          <div className="p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-secondary/90 border border-border/60 shadow-inner">
            <Icon size={14} className={`${iconColorClass} md:w-4 md:h-4`} />
          </div>
          <span className="font-black text-foreground text-[11px] md:text-xs">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-1.5 font-mono text-[10px] md:text-[11px] bg-background/80 border border-border/60 px-2 md:px-3 py-0.5 md:py-1 rounded-lg md:rounded-xl shadow-inner">
          <span className="font-extrabold text-foreground text-[11px] md:text-xs">
            {PersianNumberFormatter.toPersianDigits(
              clampedCount.toLocaleString("en-US"),
            )}
          </span>
          <span className="text-muted-foreground text-[9px] md:text-[10px]">
            {t("ofTotal", {
              total: PersianNumberFormatter.toPersianDigits(
                availableCount.toLocaleString("en-US"),
              ),
              unit: unitName,
            })}
          </span>
        </div>
      </div>

      <div className="relative flex items-center py-0.5 md:py-1">
        <div className="absolute left-0 right-0 h-1.5 md:h-2 bg-secondary/80 border border-border/60 rounded-full overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-primary/70 via-primary to-primary rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            style={{ width: `${fillRatio}%` }}
          />
        </div>

        <input
          type="range"
          min="0"
          max={Math.max(0, availableCount)}
          disabled={availableCount === 0}
          value={clampedCount}
          onChange={handleSliderChange}
          className="tactical-range-input w-full relative z-10 disabled:opacity-30"
        />
      </div>

      <PercentageSelector
        disabled={availableCount === 0}
        onSelect={handlePercentageSelect}
        colorVariant="primary"
      />
    </div>
  );
}
