import React from "react";
import { Lock } from "lucide-react";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ArmsUnitSelectorProps {
  selectedUnitType: UnitType;
  sellerTechLevel: number;
  onSelectUnit: (type: UnitType) => void;
}

export function ArmsUnitSelector({
  selectedUnitType,
  sellerTechLevel,
  onSelectUnit,
}: ArmsUnitSelectorProps) {
  const availableUnitsList = Object.values(MILITARY_UNIT_STATS);

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono block">
        انتخاب نوع تجهیزات نظامی جهت خرید
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {availableUnitsList.map((unit) => {
          const isSelected = selectedUnitType === unit.type;
          const isTechOk = sellerTechLevel >= unit.requiredTechLevel;

          return (
            <button
              key={unit.type}
              disabled={!isTechOk}
              onClick={() => onSelectUnit(unit.type as UnitType)}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-secondary border-primary shadow-sm"
                  : isTechOk
                    ? "bg-background/40 border-border/60 hover:bg-secondary/40"
                    : "bg-background/20 border-border/30 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-foreground">
                  {unit.nameFa}
                </span>
                {!isTechOk && (
                  <span className="text-[9px] text-military font-mono flex items-center gap-1">
                    <Lock size={10} />
                    سطح{" "}
                    {PersianNumberFormatter.toPersianDigits(
                      unit.requiredTechLevel,
                    )}
                    +
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-sans">
                قیمت پایه ساخت:{" "}
                {PersianNumberFormatter.formatCurrency(unit.moneyCost)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
