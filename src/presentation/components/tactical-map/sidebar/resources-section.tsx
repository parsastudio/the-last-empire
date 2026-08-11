import React from "react";
import { Cpu, Fuel, Building2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ResourcesSectionProps {
  oil: number;
  industrialLevel: number;
  infrastructureLevel?: number;
  oilRequiredPerTurn?: number;
  oilProducedPerTurn?: number;
}

export function ResourcesSection({
  oil,
  industrialLevel,
  infrastructureLevel = 1,
  oilRequiredPerTurn = 0,
  oilProducedPerTurn = 0,
}: ResourcesSectionProps) {
  const formattedOil = PersianNumberFormatter.toPersianDigits(
    oil.toLocaleString("en-US"),
  );
  const formattedIndustrial =
    PersianNumberFormatter.toPersianDigits(industrialLevel);
  const formattedInfra =
    PersianNumberFormatter.toPersianDigits(infrastructureLevel);

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Cpu size={14} className="text-primary" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          منابع استراتژیک کلان و توسعه
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono">
        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1 col-span-2">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <Fuel size={12} className="text-treasury" />
            <span>ذخایر نفت استراتژیک</span>
          </div>
          <span className="text-xs font-extrabold text-foreground block">
            {formattedOil} بلوک
          </span>
          <div className="space-y-0.5 pt-1">
            {oilProducedPerTurn > 0 && (
              <span className="text-[9px] text-gdp block font-sans font-bold">
                تولید نوبتی: +
                {PersianNumberFormatter.toPersianDigits(
                  oilProducedPerTurn.toLocaleString("en-US"),
                )}{" "}
                بلوک
              </span>
            )}
            <span className="text-[9px] text-muted-foreground block font-sans">
              مصرف نوبتی:{" "}
              {PersianNumberFormatter.toPersianDigits(oilRequiredPerTurn)} بلوک
            </span>
          </div>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <Cpu size={12} className="text-gdp" />
            <span>سطح توسعه صنعتی</span>
          </div>
          <span className="text-xs font-extrabold text-gdp block">
            سطح {formattedIndustrial}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <Building2 size={12} className="text-treasury" />
            <span>سطح توسعه زیرساخت و مواصلات</span>
          </div>
          <span className="text-xs font-extrabold text-treasury block">
            سطح {formattedInfra}
          </span>
        </div>
      </div>
    </div>
  );
}
