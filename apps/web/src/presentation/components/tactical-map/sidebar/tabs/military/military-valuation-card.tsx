import React, { useMemo } from "react";
import {
  Coins,
  Receipt,
  Layers,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { MilitaryStack } from "@/domain/military/military.schema";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { DEFAULT_NATION_MOCK } from "@/domain/nation/default-nation.mock";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

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
  const metrics = useMemo(() => {
    const totalValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(military);

    const totalUnits =
      (military.infantry || 0) +
      (military.armor || 0) +
      (military.airDefense || 0) +
      (military.airForce || 0) +
      (military.droneMissile || 0) +
      (military.navalFleet || 0);

    const activeNation: Nation = nation || {
      ...DEFAULT_NATION_MOCK,
      id: CountryRegistry.resolveCanonicalId(nationId),
      industrialLevel,
      military,
    };

    const payroll = MilitaryPayrollCalculator.calculatePayroll(
      activeNation,
      provincesMap,
    );
    const gdp = getNationGdp(activeNation, provincesMap);
    const capacityRatio =
      gdp > 0 ? Math.min(100, Math.round((totalValuation / gdp) * 100)) : 100;

    return {
      totalValuation,
      totalUnits,
      totalPayroll: payroll.total,
      isGdpCapped: payroll.gdpCapped,
      capacityRatio,
      gdp,
    };
  }, [military, industrialLevel, nationId, nation, provincesMap]);

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
            {PersianNumberFormatter.toPersianDigits(
              metrics.totalUnits.toLocaleString("en-US"),
            )}{" "}
            یگان فعال
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
        <div className="bg-secondary/40 border border-border/50 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <Coins size={12} className="text-gdp" />
            ارزش کل زرادخانه (سقف ۱۰۰٪ GDP):
          </span>
          <span className="font-extrabold text-gdp text-xs block truncate">
            {PersianNumberFormatter.formatCurrency(
              metrics.totalValuation,
              true,
            )}
          </span>
          <span className="text-[9px] text-muted-foreground block font-sans">
            {PersianNumberFormatter.toPersianDigits(metrics.capacityRatio)}٪ از
            سقف مجاز GDP
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <TrendingDown size={12} className="text-military" />
            هزینه نگهداری هر نوبت (۱۰٪):
          </span>
          <span className="font-extrabold text-military text-xs block truncate">
            -{PersianNumberFormatter.formatCurrency(metrics.totalPayroll, true)}
          </span>
          {metrics.isGdpCapped && (
            <span className="text-[9px] text-amber-400 font-bold block font-sans flex items-center gap-0.5">
              <ShieldCheck size={10} />
              مهارشده در سقف ۱۰٪ GDP
            </span>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/20 p-2.5 rounded-xl border border-border/40 font-sans">
        هزینه نگهداری نوبتی ارتش دقیقاً ۱۰٪ ارزش نیروهاست و تحت هیچ شرایطی از
        ۱۰٪ تولید ناخالص (GDP) کشور فراتر نمی‌رود.
      </p>
    </div>
  );
}
