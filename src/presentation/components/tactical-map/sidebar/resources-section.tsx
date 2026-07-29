import React from "react";
import { Cpu, Fuel, Wrench, Users, Building2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ResourcesSectionProps {
  oil: number;
  steel: number;
  manpower: number;
  industrialLevel: number;
  infrastructureLevel?: number;
  oilRequiredPerTurn?: number;
  oilProducedPerTurn?: number;
  steelProducedPerTurn?: number;
}

export function ResourcesSection({
  oil,
  steel,
  manpower,
  industrialLevel,
  infrastructureLevel = 1,
  oilProducedPerTurn = 0,
  steelProducedPerTurn = 0,
}: ResourcesSectionProps) {
  const formattedOil = PersianNumberFormatter.toPersianDigits(
    oil.toLocaleString("en-US"),
  );
  const formattedSteel = PersianNumberFormatter.toPersianDigits(
    steel.toLocaleString("en-US"),
  );
  const formattedManpower = PersianNumberFormatter.toPersianDigits(
    manpower.toLocaleString("en-US"),
  );
  const formattedIndustrial =
    PersianNumberFormatter.toPersianDigits(industrialLevel);
  const formattedInfra =
    PersianNumberFormatter.toPersianDigits(infrastructureLevel);

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Cpu size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          منابع حیاتی و توسعه
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono">
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans">
            <Fuel size={12} className="text-treasury" />
            <span>ذخایر نفت خام</span>
          </div>
          <span className="text-xs font-bold text-foreground block">
            {formattedOil} بشکه
          </span>
          <div className="space-y-0.5 pt-0.5">
            {oilProducedPerTurn > 0 && (
              <span className="text-[9px] text-gdp block font-sans">
                تولید نوبتی: +
                {PersianNumberFormatter.toPersianDigits(
                  oilProducedPerTurn.toLocaleString("en-US"),
                )}{" "}
                بشکه
              </span>
            )}
            <span className="text-[9px] text-muted-foreground block font-sans">
              مصرف نوبتی: بدون مصرف در صلح
            </span>
          </div>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans">
            <Wrench size={12} className="text-primary" />
            <span>ذخایر فولاد</span>
          </div>
          <span className="text-xs font-bold text-foreground block">
            {formattedSteel} تن
          </span>
          {steelProducedPerTurn > 0 && (
            <span className="text-[9px] text-gdp block font-sans pt-0.5">
              تولید نوبتی: +
              {PersianNumberFormatter.toPersianDigits(
                steelProducedPerTurn.toLocaleString("en-US"),
              )}{" "}
              تن
            </span>
          )}
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans">
            <Users size={12} className="text-gdp" />
            <span>نیروی انسانی آماده</span>
          </div>
          <span className="text-xs font-bold text-foreground block">
            {formattedManpower} نفر
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans">
            <Cpu size={12} className="text-gdp" />
            <span>سطح توسعه صنعتی</span>
          </div>
          <span className="text-xs font-bold text-gdp block">
            سطح {formattedIndustrial}
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1 col-span-2">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans">
            <Building2 size={12} className="text-treasury" />
            <span>سطح توسعه زیرساخت و مواصلات</span>
          </div>
          <span className="text-xs font-bold text-treasury block">
            سطح {formattedInfra}
          </span>
        </div>
      </div>
    </div>
  );
}
