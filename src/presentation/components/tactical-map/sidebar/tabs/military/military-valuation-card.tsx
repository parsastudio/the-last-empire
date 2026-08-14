import React, { useMemo } from "react";
import { Coins, Receipt, Layers, TrendingDown } from "lucide-react";
import { MilitaryStack } from "@/domain/military/military.schema";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { DEFAULT_NATION_MOCK } from "@/domain/nation/default-nation.mock";

interface MilitaryValuationCardProps {
  military: MilitaryStack;
  industrialLevel?: number;
  nationId?: string;
  nation?: Nation;
}

export function MilitaryValuationCard({
  military,
  industrialLevel = 1,
  nationId = "NATION_DEFAULT",
  nation,
}: MilitaryValuationCardProps) {
  const metrics = useMemo(() => {
    const techLevel = military.techLevel || 1;
    const indLevel = industrialLevel || 1;

    const unitTypes = [
      { key: "infantry" as const, type: "INFANTRY" as const },
      { key: "armor" as const, type: "ARMOR" as const },
      { key: "airDefense" as const, type: "AIR_DEFENSE" as const },
      { key: "airForce" as const, type: "AIR_FORCE" as const },
      { key: "droneMissile" as const, type: "DRONE_MISSILE" as const },
      { key: "navalFleet" as const, type: "NAVAL_FLEET" as const },
    ];

    let totalValuation = 0;
    let totalUnits = 0;

    for (const u of unitTypes) {
      const count = military[u.key] || 0;
      totalUnits += count;
      const unitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
        u.type,
        techLevel,
        indLevel,
      );
      totalValuation += count * unitPrice;
    }

    const activeNation: Nation = nation || {
      ...DEFAULT_NATION_MOCK,
      id: nationId,
      industrialLevel: indLevel,
      military,
    };

    const payroll = MilitaryPayrollCalculator.calculatePayroll(activeNation);

    return {
      totalValuation,
      totalUnits,
      totalPayroll: payroll.total,
    };
  }, [military, industrialLevel, nationId, nation]);

  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
          <Receipt size={15} className="text-treasury" />
          <span>ارزش دارایی‌ها و بودجه لجستیک ارتش</span>
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
            ارزش روز کل زرادخانه:
          </span>
          <span className="font-extrabold text-gdp text-xs block truncate">
            {PersianNumberFormatter.formatCurrency(
              metrics.totalValuation,
              true,
            )}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block font-sans flex items-center gap-1">
            <TrendingDown size={12} className="text-military" />
            هزینه نگهداری هر نوبت:
          </span>
          <span className="font-extrabold text-military text-xs block truncate">
            -{PersianNumberFormatter.formatCurrency(metrics.totalPayroll, true)}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/20 p-2.5 rounded-xl border border-border/40 font-sans">
        هزینه نگهداری نوبتی ارتش به طور خودکار در پایان هر نوبت از خزانه ملی کسر
        می‌گردد. ارتقای سطح صنعت و دکترین‌های خودکارسازی باعث کاهش این مخارج
        می‌شوند.
      </p>
    </div>
  );
}
