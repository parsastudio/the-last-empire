import React from "react";
import { Coins, Fuel, Navigation, Anchor } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface AttackLogisticsTableProps {
  estimatedCost: number;
  landTransitCost: number;
  heavyTransitCost: number;
  distanceKm: number;
  requiredOil?: number;
  requiredSteel?: number;
}

export function AttackLogisticsTable({
  estimatedCost,
  landTransitCost,
  heavyTransitCost,
  distanceKm,
  requiredOil = 50,
}: AttackLogisticsTableProps) {
  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
        برآورد هزینه‌ها و لجستیک تفکیکی عملیات
      </span>

      <div className="bg-background/40 border border-border/80 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
            <Navigation size={13} className="text-primary" />
            مسافت ترانزیت تا تئاتر عملیات
          </span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              distanceKm.toLocaleString("en-US"),
            )}{" "}
            کیلومتر
          </span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
            <Coins size={13} className="text-gdp" />
            هزینه ترانزیت و اعزام نیروهای زمینی
          </span>
          <span className="font-bold text-foreground">
            $
            {PersianNumberFormatter.toPersianDigits(
              landTransitCost.toLocaleString("en-US"),
            )}{" "}
            دلار
          </span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
            <Anchor size={13} className="text-amber-500" />
            هزینه ترانزیت و ارسال دریایی تجهیزات
          </span>
          <span className="font-bold text-foreground">
            $
            {PersianNumberFormatter.toPersianDigits(
              heavyTransitCost.toLocaleString("en-US"),
            )}{" "}
            دلار
          </span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-border/40 bg-secondary/30 p-2 rounded-xl">
          <span className="text-foreground font-bold font-sans text-[11px]">
            مجموع کل هزینه مالی ترانزیت
          </span>
          <span className="font-extrabold text-gdp text-sm">
            $
            {PersianNumberFormatter.toPersianDigits(
              estimatedCost.toLocaleString("en-US"),
            )}{" "}
            دلار
          </span>
        </div>

        <div className="flex justify-between items-center pt-0.5">
          <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
            <Fuel size={13} className="text-treasury" />
            مجموع سوخت و نفت استراتژیک مورد نیاز
          </span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              requiredOil.toLocaleString("en-US"),
            )}{" "}
            بشکه
          </span>
        </div>
      </div>
    </div>
  );
}
