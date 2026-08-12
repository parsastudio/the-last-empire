"use client";

import React from "react";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface RangePercentageControlProps {
  label?: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  unitLabel?: string;
  disabled?: boolean;
  colorVariant?: "primary" | "gdp" | "military" | "treasury";
  formattedValue?: string;
  onChange: (value: number) => void;
  onPercentageSelect?: (percentage: number) => void;
}

export function RangePercentageControl({
  label,
  value,
  min = 0,
  max,
  step = 1,
  unitLabel,
  disabled = false,
  colorVariant = "gdp",
  formattedValue,
  onChange,
  onPercentageSelect,
}: RangePercentageControlProps) {
  const safeMax = Math.max(0, max);
  const clampedValue = Math.min(safeMax, Math.max(min, value));

  const handlePercentageClick = (pct: number) => {
    if (disabled || safeMax <= 0) return;
    if (onPercentageSelect) {
      onPercentageSelect(pct);
    } else {
      const target = Math.max(min, Math.floor((safeMax * pct) / step) * step);
      onChange(target);
    }
  };

  const getAccentClass = () => {
    switch (colorVariant) {
      case "military":
        return "accent-rose-500";
      case "primary":
        return "accent-primary";
      case "treasury":
        return "accent-amber-500";
      case "gdp":
      default:
        return "accent-emerald-500";
    }
  };

  return (
    <div className="space-y-2 dir-rtl text-right font-sans">
      {(label || formattedValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {formattedValue && (
            <span className="font-bold text-foreground font-mono">
              {formattedValue} {unitLabel || ""}
            </span>
          )}
        </div>
      )}

      <input
        type="range"
        min={min}
        max={safeMax}
        step={step}
        disabled={disabled || safeMax === 0}
        value={clampedValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30 ${getAccentClass()}`}
      />

      <PercentageSelector
        disabled={disabled || safeMax === 0}
        onSelect={handlePercentageClick}
        colorVariant={colorVariant}
      />
    </div>
  );
}
