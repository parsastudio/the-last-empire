import React from "react";
import { Check, ShieldAlert, Sparkles } from "lucide-react";
import {
  GovernmentType,
  GovernmentOption,
  GOVERNMENT_OPTIONS,
  GOVERNMENT_TRAITS_CONFIG,
} from "@geopolitics/domain";

export type { GovernmentOption };
export { GOVERNMENT_OPTIONS };

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
  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
          ساختار نظام سیاسی و توازن دکترین حاکم
        </span>
        <span className="text-[10px] font-mono font-bold text-gdp bg-gdp/10 border border-gdp/30 px-2 py-0.5 rounded-lg">
          ماتریس کاملاً متوازن (Zero-Sum Balance)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {options.map((gov) => {
          const isSelected = selectedType === gov.type;
          const trait =
            GOVERNMENT_TRAITS_CONFIG[gov.type as GovernmentType] ??
            GOVERNMENT_TRAITS_CONFIG.PLURALIST_PARLIAMENTARY;

          return (
            <button
              key={gov.type}
              type="button"
              onClick={() => onSelect(gov.type)}
              className={`p-4.5 rounded-2xl text-right transition-all border flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? "bg-secondary/95 border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/50"
                  : "bg-background/50 border-border/80 hover:bg-secondary/50 hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-foreground font-sans block group-hover:text-primary transition-colors">
                    {trait.nameFa}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground block">
                    {trait.headlineFa}
                  </span>
                </div>

                <span
                  className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-background"
                  }`}
                >
                  {isSelected && <Check size={11} strokeWidth={3} />}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground/90 leading-relaxed font-sans">
                {gov.desc}
              </p>

              <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-border/50 text-[10px] font-sans w-full">
                {trait.prosFa.map((pro, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-gdp font-semibold"
                  >
                    <Sparkles size={11} className="shrink-0" />
                    <span>{pro}</span>
                  </div>
                ))}
                {trait.consFa.map((con, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-rose-400 font-semibold"
                  >
                    <ShieldAlert size={11} className="shrink-0" />
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
