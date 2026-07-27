import React from "react";

export interface GovernmentOption {
  type: string;
  name: string;
  desc: string;
}

interface GovernmentTypeSelectorProps {
  options: GovernmentOption[];
  selectedType: string;
  onSelect: (type: string) => void;
}

export function GovernmentTypeSelector({
  options,
  selectedType,
  onSelect,
}: GovernmentTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
        انتخاب نوع نظام سیاسی
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((gov) => {
          const isSelected = selectedType === gov.type;
          return (
            <button
              key={gov.type}
              onClick={() => onSelect(gov.type)}
              className={`p-4 rounded-2xl text-right transition-all border flex flex-col justify-between gap-2 cursor-pointer ${
                isSelected
                  ? "bg-secondary border-primary shadow-inner"
                  : "bg-background/40 border-border/80 hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-foreground">
                  {gov.name}
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-border"}`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                  )}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {gov.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
