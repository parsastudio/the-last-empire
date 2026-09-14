"use client";

import React from "react";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";
import { ActionColorVariant } from "./utils/action-variant-style.utility";

interface TacticalRangeSliderProps {
  value: number;
  max: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  colorVariant?: ActionColorVariant;
  showPercentageSelector?: boolean;
  onChange: (value: number) => void;
}

export function TacticalRangeSlider({
  value,
  max,
  min = 0,
  step = 1,
  disabled = false,
  colorVariant = "gdp",
  showPercentageSelector = true,
  onChange,
}: TacticalRangeSliderProps) {
  const safeMax = Math.max(0, max);
  const clampedValue = Math.max(min, Math.min(value, safeMax));
  const fillRatio = safeMax > 0 ? (clampedValue / safeMax) * 100 : 0;

  const handlePercentageSelect = (pct: number) => {
    if (safeMax <= 0 || disabled) return;
    const target = Math.max(min, Math.floor((safeMax * pct) / step) * step);
    onChange(target);
  };

  return (
    <div className="space-y-2 font-sans w-full">
      <div className="relative flex items-center py-1">
        <div className="absolute start-0 end-0 h-2 bg-secondary/80 border border-border/60 rounded-full overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-primary/70 via-primary to-primary rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            style={{ width: `${fillRatio}%` }}
          />
        </div>

        <input
          type="range"
          min={safeMax > 0 ? min : 0}
          max={safeMax}
          step={step}
          disabled={disabled || safeMax === 0}
          value={clampedValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="tactical-range-input w-full relative z-10 disabled:opacity-30"
        />
      </div>

      {showPercentageSelector && (
        <PercentageSelector
          disabled={disabled || safeMax === 0}
          onSelect={handlePercentageSelect}
          colorVariant={colorVariant}
        />
      )}
    </div>
  );
}
