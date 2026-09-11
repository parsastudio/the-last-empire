import React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("governments");
  const currentType = selectedType as GovernmentType;
  const ActiveIcon = GOVERNMENT_ICONS[currentType] ?? Landmark;

  return (
    <div className="space-y-3 sm:space-y-4 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] sm:text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
          {t("selectorTitle")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {options.map((gov) => {
          const isSelected = selectedType === gov.type;
          const govType = gov.type as GovernmentType;
          const Icon = GOVERNMENT_ICONS[govType] ?? Landmark;
          const name = t(`${govType}.name`);
          const headline = t(`${govType}.headline`);

          return (
            <button
              key={gov.type}
              type="button"
              onClick={() => onSelect(gov.type)}
              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-right transition-all border flex items-center justify-between gap-2.5 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? "bg-primary/15 border-primary shadow-md ring-1 ring-primary/40 scale-[1.005]"
                  : "bg-background/50 border-border/70 hover:bg-secondary/60 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border/60 group-hover:text-foreground group-hover:border-primary/40"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <span
                    className={`text-[11px] sm:text-xs font-black block truncate transition-colors ${
                      isSelected
                        ? "text-primary"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground block truncate">
                    {headline}
                  </span>
                </div>
              </div>

              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-background"
                }`}
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <GovernmentTraitDetailsCard type={currentType} icon={ActiveIcon} />
    </div>
  );
}
