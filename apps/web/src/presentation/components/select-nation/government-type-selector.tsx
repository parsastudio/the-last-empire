import React from "react";
import {
  Check,
  Landmark,
  Building2,
  Flame,
  Crown,
  Cpu,
  LucideIcon,
} from "lucide-react";
import {
  GovernmentType,
  GovernmentOption,
  GOVERNMENT_OPTIONS,
  GOVERNMENT_TRAITS_CONFIG,
} from "@geopolitics/domain";
import { GovernmentTraitDetailsCard } from "./government-trait-details-card";

export type { GovernmentOption };
export { GOVERNMENT_OPTIONS };

const GOVERNMENT_ICONS: Record<GovernmentType, LucideIcon> = {
  PLURALIST_PARLIAMENTARY: Landmark,
  CENTRALIZED_PRESIDENTIAL: Building2,
  IDEOLOGICAL_REGIME: Flame,
  HEREDITARY_MONARCHY: Crown,
  TECHNOCRATIC_ONE_PARTY: Cpu,
};

interface GovernmentTypeSelectorProps {
  options?: GovernmentOption[];
  selectedType: string;
  onSelect: (type: string) => void;
}

export function GovernmentTypeSelector({
  options = GOVERNMENT_OPTIONS,
  selectedType,
  onSelect,
}: GovernmentTypeSelectorProps) {
  const activeTrait =
    GOVERNMENT_TRAITS_CONFIG[selectedType as GovernmentType] ??
    GOVERNMENT_TRAITS_CONFIG.PLURALIST_PARLIAMENTARY;

  const ActiveIcon =
    GOVERNMENT_ICONS[selectedType as GovernmentType] ?? Landmark;

  return (
    <div className="space-y-4 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
          انتخاب ساختار سیاسی و نظام حاکمیت
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((gov) => {
          const isSelected = selectedType === gov.type;
          const trait =
            GOVERNMENT_TRAITS_CONFIG[gov.type as GovernmentType] ??
            GOVERNMENT_TRAITS_CONFIG.PLURALIST_PARLIAMENTARY;

          const Icon = GOVERNMENT_ICONS[gov.type as GovernmentType] ?? Landmark;

          return (
            <button
              key={gov.type}
              type="button"
              onClick={() => onSelect(gov.type)}
              className={`p-4 rounded-2xl text-right transition-all border flex items-center justify-between gap-3.5 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? "bg-primary/15 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/40 scale-[1.01]"
                  : "bg-background/50 border-border/70 hover:bg-secondary/60 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border/60 group-hover:text-foreground group-hover:border-primary/40"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <span
                    className={`text-xs font-black block truncate transition-colors ${
                      isSelected
                        ? "text-primary"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {trait.nameFa}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {trait.headlineFa}
                  </span>
                </div>
              </div>

              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-background"
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <GovernmentTraitDetailsCard trait={activeTrait} icon={ActiveIcon} />
    </div>
  );
}
