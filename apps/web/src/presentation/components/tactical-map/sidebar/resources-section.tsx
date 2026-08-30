import React from "react";
import { Factory, Cpu, Hammer, TrendingUp } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";

interface ResourcesSectionProps {
  totalActiveFactories: number;
  totalMaxSlots: number;
  industrialLevel: number;
  equipmentTechLevel: number;
}

export function ResourcesSection({
  totalActiveFactories,
  totalMaxSlots,
  industrialLevel,
  equipmentTechLevel,
}: ResourcesSectionProps) {
  const factoryYield =
    IndustryCalculator.calculateFactoryYield(equipmentTechLevel);
  const formattedYield = PersianNumberFormatter.formatCurrency(
    factoryYield,
    true,
  );
  const occupancyPct =
    totalMaxSlots > 0
      ? Math.round((totalActiveFactories / totalMaxSlots) * 100)
      : 100;

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Factory size={14} className="text-primary" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          ظرفیت صنعتی و زنجیره تولید کارخانجات
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono">
        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1.5 col-span-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Factory size={12} className="text-gdp" />
              <span>اسلات‌های فعال کارخانه‌ها</span>
            </span>
            <span className="text-foreground font-bold">
              {PersianNumberFormatter.toPersianDigits(occupancyPct)}٪ فعال
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>
              {PersianNumberFormatter.formatNumberWithCommas(
                totalActiveFactories,
              )}{" "}
              سوله فعال
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              از سقف دائم{" "}
              {PersianNumberFormatter.formatNumberWithCommas(totalMaxSlots)}{" "}
              اسلات
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-gdp"
              style={{ width: `${Math.min(100, occupancyPct)}%` }}
            />
          </div>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <TrendingUp size={12} className="text-gdp" />
            <span>بازدهی هر کارخانه</span>
          </div>
          <span className="text-xs font-extrabold text-gdp block">
            {formattedYield}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <Cpu size={12} className="text-primary" />
            <span>دانش / ابزارآلات</span>
          </div>
          <span className="text-xs font-extrabold text-primary block">
            لِوِل{" "}
            {PersianNumberFormatter.toPersianDigits(industrialLevel.toFixed(1))}{" "}
            /{" "}
            {PersianNumberFormatter.toPersianDigits(
              equipmentTechLevel.toFixed(1),
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
