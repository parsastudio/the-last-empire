import React from "react";
import { Cpu, Building2, Users, TrendingUp } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ResourcesSectionProps {
  population: number;
  maxPopulationCapacity?: number;
  perCapitaProductivity?: number;
  industrialLevel: number;
  infrastructureLevel?: number;
}

export function ResourcesSection({
  population,
  maxPopulationCapacity,
  perCapitaProductivity = 5000,
  industrialLevel,
  infrastructureLevel = 1,
}: ResourcesSectionProps) {
  const capacity = maxPopulationCapacity || Math.floor(population / 0.95);
  const capacityPct = Math.round((population / (capacity || 1)) * 100);

  const formattedPop = PersianNumberFormatter.formatCompactNumber(population);
  const formattedCap = PersianNumberFormatter.formatCompactNumber(capacity);
  const formattedProd = PersianNumberFormatter.formatCurrency(
    perCapitaProductivity,
    true,
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
          ظرفیت زیرساخت، مسکن و بهره‌وری سرانه
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono">
        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1.5 col-span-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Building2 size={12} className="text-treasury" />
              <span>ظرفیت زیستی و مسکن کشور</span>
            </span>
            <span className="text-foreground font-bold">
              {PersianNumberFormatter.toPersianDigits(capacityPct)}٪ اشغال
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>{formattedPop} نفر</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              از سقف {formattedCap}
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                capacityPct > 100
                  ? "bg-military"
                  : capacityPct >= 95
                    ? "bg-treasury"
                    : "bg-gdp"
              }`}
              style={{ width: `${Math.min(100, capacityPct)}%` }}
            />
          </div>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <TrendingUp size={12} className="text-gdp" />
            <span>بهره‌وری سرانه نیروی کار</span>
          </div>
          <span className="text-xs font-extrabold text-gdp block">
            {formattedProd} / نفر
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <Users size={12} className="text-primary" />
            <span>سطح صنعت و آموزش</span>
          </div>
          <span className="text-xs font-extrabold text-primary block">
            سطح {formattedIndustrial}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1 col-span-2">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-sans font-bold">
            <Building2 size={12} className="text-treasury" />
            <span>سطح توسعه زیرساخت مواصلاتی و مسکن</span>
          </div>
          <span className="text-xs font-extrabold text-treasury block">
            سطح {formattedInfra} (افزایش سقف تراکم زیستی)
          </span>
        </div>
      </div>
    </div>
  );
}
