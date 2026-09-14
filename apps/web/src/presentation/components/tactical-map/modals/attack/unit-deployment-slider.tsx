import React from "react";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";
import { TacticalRangeSlider } from "@/presentation/components/common/tactical-range-slider";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const { formatNumber } = useLocaleFormatter();

  const clampedCount = Math.min(availableCount, Math.max(0, selectedCount));

  const handleValueChange = (val: number) => {
    TacticalSound.playSliderTick();
    onChange(val);
  };

  return (
    <div className="bg-secondary/40 border border-border/70 p-2.5 md:p-4 rounded-2xl md:rounded-3xl space-y-2 md:space-y-3 font-sans text-start hover:border-primary/40 transition-all shadow-md backdrop-blur-xl relative overflow-hidden group">
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
            {formatNumber(clampedCount)}
          </span>
          <span className="text-muted-foreground text-[9px] md:text-[10px]">
            {t("ofTotal", {
              total: formatNumber(availableCount),
              unit: unitName,
            })}
          </span>
        </div>
      </div>

      <TacticalRangeSlider
        value={clampedCount}
        max={availableCount}
        min={0}
        step={1}
        disabled={availableCount === 0}
        colorVariant="primary"
        showPercentageSelector={true}
        onChange={handleValueChange}
      />
    </div>
  );
}
