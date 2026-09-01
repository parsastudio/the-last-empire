import React from "react";
import { Factory, Globe2, Anchor, Compass, TrendingUp } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface BuyProvinceMetricsGridProps {
  provinceGdp: number;
  factoriesCount: number;
  maxSlots: number;
  pixelCount: number;
  hasSeaAccess: boolean;
  costMultiplier: number;
}

export function BuyProvinceMetricsGrid({
  provinceGdp,
  factoriesCount,
  maxSlots,
  pixelCount,
  hasSeaAccess,
  costMultiplier,
}: BuyProvinceMetricsGridProps) {
  const activePct =
    maxSlots > 0 ? Math.round((factoriesCount / maxSlots) * 100) : 100;
  const pctText = Math.round(costMultiplier * 100);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
          <span className="flex items-center gap-1">
            <TrendingUp size={13} className="text-gdp shrink-0" />
            <span>تولید ناخالص (GDP)</span>
          </span>
        </div>
        <span className="font-black text-gdp text-sm block truncate">
          +{PersianNumberFormatter.formatCurrency(provinceGdp, true)}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          درآمد پایدار هر نوبت
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
          <span className="flex items-center gap-1">
            <Factory size={13} className="text-primary shrink-0" />
            <span>ظرفیت کارخانجات</span>
          </span>
        </div>
        <span className="font-black text-foreground text-sm block truncate">
          {PersianNumberFormatter.formatNumberWithCommas(factoriesCount)} /{" "}
          {PersianNumberFormatter.formatNumberWithCommas(maxSlots)}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          {PersianNumberFormatter.toPersianDigits(activePct)}٪ اسلات‌ها فعال
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
          <span className="flex items-center gap-1">
            <Globe2 size={13} className="text-treasury shrink-0" />
            <span>وسعت جغرافیایی</span>
          </span>
        </div>
        <span className="font-black text-foreground text-sm block truncate">
          {PersianNumberFormatter.formatNumberWithCommas(pixelCount)} پیکسل
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          گسترش مساحت ملی
        </span>
      </div>

      <div
        className={`p-3.5 rounded-2xl space-y-1.5 border shadow-sm ${
          hasSeaAccess
            ? "bg-cyan-950/25 border-cyan-500/40 text-cyan-300"
            : "bg-secondary/40 border-border/80 text-muted-foreground"
        }`}
      >
        <div className="flex items-center justify-between text-[10px] font-sans">
          <span className="flex items-center gap-1">
            {hasSeaAccess ? (
              <Anchor size={13} className="text-cyan-400 shrink-0" />
            ) : (
              <Compass size={13} className="text-amber-400 shrink-0" />
            )}
            <span>موقعیت ترانزیتی</span>
          </span>
        </div>
        <span className="font-black text-sm block truncate font-sans">
          {hasSeaAccess ? "دسترسی به آب آزاد" : "محصور در خشکی"}
        </span>
        <span className="text-[9px] opacity-80 font-sans block">
          تعرفه پایه: {PersianNumberFormatter.toPersianDigits(pctText)}٪ ارزش
          GDP
        </span>
      </div>
    </div>
  );
}
