import React from "react";
import { GOVERNMENT_TYPE_PERSIAN_MAP } from "@/domain/politics/government-label.utility";

export interface GovernmentOption {
  type: string;
  name: string;
  desc: string;
}

export const GOVERNMENT_OPTIONS: GovernmentOption[] = [
  {
    type: "DEMOCRACY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.DEMOCRACY,
    desc: "باعث رشد اقتصادی سریع‌تر و پاداش دیپلماتیک می‌شود، اما در برابر جنگ‌افروزی و فرسایش بحران آسیب‌پذیرتر است.",
  },
  {
    type: "DICTATORSHIP",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.DICTATORSHIP,
    desc: "قدرت متمرکز و پایداری نظامی بالا، اما با هزینه بالای فساد ساختاری و نارضایتی شدید مردمی همراه است.",
  },
  {
    type: "MONARCHY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.MONARCHY,
    desc: "ثبات سنتی بالا، مشروعیت بالا و هزینه‌های بهینه فرمانروایی با انعطاف‌پذیری متوسط در برابر بحران‌ها.",
  },
  {
    type: "COMMUNISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.COMMUNISM,
    desc: "بسیج عمومی بالا برای صنایع و ارتش، کاهش هزینه‌های نگهداری ادوات جنگی و تمرکز شدید دولتی.",
  },
  {
    type: "FASCISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.FASCISM,
    desc: "قدرت مرگبار تهاجمی و پاداش فوق‌العاده در نبردها، در عوض انزوای جهانی و فرسایش شدید ساختاری.",
  },
];

interface GovernmentTypeSelectorProps {
  options: GovernmentOption[];
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
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
        ساختار نظام سیاسی حاکم
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((gov) => {
          const isSelected = selectedType === gov.type;
          return (
            <button
              key={gov.type}
              onClick={() => onSelect(gov.type)}
              className={`p-4 rounded-2xl text-right transition-all border flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-secondary/90 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                  : "bg-background/50 border-border/80 hover:bg-secondary/50 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-foreground font-sans">
                  {gov.name}
                </span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border/80 bg-background"
                  }`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                  )}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                {gov.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
