import React from "react";
import { Building2, Users, Globe2, TrendingUp } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface BuyProvinceMetricsGridProps {
  provinceGdp: number;
  population: number;
  capacityPercentage: number;
  pixelCount: number;
  costMultiplier: number;
}

export function BuyProvinceMetricsGrid({
  provinceGdp,
  population,
  capacityPercentage,
  pixelCount,
  costMultiplier,
}: BuyProvinceMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
      <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <Building2 size={12} className="text-gdp shrink-0" />
          <span>تولید ناخالص استان:</span>
        </div>
        <span className="font-black text-gdp text-xs block truncate">
          {PersianNumberFormatter.formatCurrency(provinceGdp, true)}
        </span>
        <span className="text-[8px] text-muted-foreground font-sans block">
          درآمد پایدار نوبتی
        </span>
      </div>

      <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <Users size={12} className="text-primary shrink-0" />
          <span>جمعیت و نیروی کار:</span>
        </div>
        <span className="font-black text-foreground text-xs block truncate">
          {PersianNumberFormatter.formatCompactNumber(population)} نفر
        </span>
        <span className="text-[8px] text-muted-foreground font-sans block">
          {PersianNumberFormatter.toPersianDigits(capacityPercentage)}٪ اشغال
          مسکن
        </span>
      </div>

      <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <Globe2 size={12} className="text-treasury shrink-0" />
          <span>وسعت خاک:</span>
        </div>
        <span className="font-black text-foreground text-xs block truncate">
          {PersianNumberFormatter.toPersianDigits(
            (pixelCount || 0).toLocaleString("en-US"),
          )}{" "}
          پیکسل
        </span>
        <span className="text-[8px] text-muted-foreground font-sans block">
          گسترش مرزهای ملی
        </span>
      </div>

      <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <TrendingUp size={12} className="text-emerald-400 shrink-0" />
          <span>توجیه اقتصادی:</span>
        </div>
        <span className="font-black text-emerald-400 text-xs block font-sans">
          بسیار سودده
        </span>
        <span className="text-[8px] text-muted-foreground font-sans block">
          بازگشت اصل سرمایه در{" "}
          {PersianNumberFormatter.toPersianDigits(costMultiplier)} نوبت
        </span>
      </div>
    </div>
  );
}
