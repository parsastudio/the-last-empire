import React, { useMemo } from "react";
import {
  Coins,
  Receipt,
  Layers,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { MilitaryStack } from "@/domain/military/military.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { selectMilitaryValuationViewModel } from "@/presentation/selectors/military-view-model.selector";

interface MilitaryValuationCardProps {
  military: MilitaryStack;
  industrialLevel?: number;
  nationId?: string;
  nation?: Nation;
  provincesMap?: Record<string, Province>;
}

export function MilitaryValuationCard({
  military,
  industrialLevel = 1,
  nationId = "IRN",
  nation,
  provincesMap,
}: MilitaryValuationCardProps) {
  const metrics = useMemo(
    () =>
      selectMilitaryValuationViewModel(
        military,
        industrialLevel,
        nationId,
        nation,
        provincesMap,
      ),
    [military, industrialLevel, nationId, nation, provincesMap],
  );

  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
          <Receipt size={15} className="text-treasury" />
          <span>ارزش دارایی‌ها و بودجه نگهداری ارتش</span>
        </div>
        <span className="text-[10px] font-mono bg-secondary/80 px-2 py-0.5 rounded-lg text-muted-foreground border border-border/50 flex items-center gap-1">
          <Layers size={11} />
          <span>
            {PersianNumberFormatter.formatNumberWithCommas(metrics.totalUnits)}{" "}
            یگان فعال
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
        <div className="bg-secondary/40 border border-border/50 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <Coins size={12} className="text-gdp" />
            ارزش کل زرادخانه (سقف ۲۰٪ GDP):
          </span>
          <span className="font-extrabold text-gdp text-xs block truncate">
            {PersianNumberFormatter.formatCurrency(
              metrics.totalValuation,
              true,
            )}
          </span>
          <span className="text-[9px] text-muted-foreground block font-sans">
            {PersianNumberFormatter.toPersianDigits(metrics.capacityRatio)}٪ از
            سقف مجاز ارتش
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <TrendingDown size={12} className="text-military" />
            هزینه نگهداری هر نوبت (۶٪):
          </span>
          <span className="font-extrabold text-military text-xs block truncate">
            -{PersianNumberFormatter.formatCurrency(metrics.totalPayroll, true)}
          </span>
          {metrics.isGdpCapped && (
            <span className="text-[9px] text-amber-400 font-bold block font-sans flex items-center gap-0.5">
              <ShieldCheck size={10} />
              مهارشده در سقف ۶٪ GDP
            </span>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/20 p-2.5 rounded-xl border border-border/40 font-sans">
        هزینه نگهداری نوبتی ارتش ۶٪ ارزش کل یگان‌هاست و سقف مجاز ارزش ارتش معادل
        ۲۰٪ تولید ناخالص (GDP) کشور می‌باشد.
      </p>
    </div>
  );
}
