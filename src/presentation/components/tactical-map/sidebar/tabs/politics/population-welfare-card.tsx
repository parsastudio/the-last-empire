import React, { useMemo } from "react";
import { Users, Fuel, Wrench, HeartPulse } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

interface PopulationWelfareCardProps {
  population?: number;
  oilStock?: number;
  steelStock?: number;
}

export function PopulationWelfareCard({
  population = 80000000,
  oilStock = 1000,
  steelStock = 1000,
}: PopulationWelfareCardProps) {
  const welfareCalc = useMemo(() => new PopulationWelfareCalculator(), []);

  const metrics = useMemo(() => {
    return welfareCalc.evaluateWelfare(population, oilStock, steelStock);
  }, [welfareCalc, population, oilStock, steelStock]);

  const formattedPop = useMemo(() => {
    if (population >= 1e9) {
      return `${PersianNumberFormatter.toPersianDigits((population / 1e9).toFixed(2))} میلیارد نفر`;
    }
    return `${PersianNumberFormatter.toPersianDigits((population / 1e6).toFixed(1))} میلیون نفر`;
  }, [population]);

  const oilPct = Math.round(metrics.oilFulfillment * 100);
  const steelPct = Math.round(metrics.steelFulfillment * 100);

  return (
    <div className="space-y-2.5 text-right dir-rtl">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users size={13} className="text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            جمعیت ملی و رفاه مصرفی
          </span>
        </div>
        <span className="text-xs font-extrabold text-foreground font-mono bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/60">
          {formattedPop}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            نوسان رفاهی ثبات نوبتی:
          </span>
          <span
            className={`font-bold text-xs flex items-center gap-1 ${
              metrics.totalStabilityImpact > 0
                ? "text-gdp"
                : metrics.totalStabilityImpact < 0
                  ? "text-military"
                  : "text-foreground"
            }`}
          >
            <HeartPulse size={13} />
            {metrics.totalStabilityImpact > 0 ? "+" : ""}
            {PersianNumberFormatter.toPersianDigits(
              metrics.totalStabilityImpact,
            )}
            ٪
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="bg-secondary/40 p-3 rounded-xl space-y-1.5 border border-border/40">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-sans">
                <Fuel size={12} className="text-treasury" />
                <span>مصرف نفت خام جمعیت:</span>
              </div>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.toPersianDigits(
                  metrics.oilDemand.toLocaleString("en-US"),
                )}{" "}
                بشکه / نوبت
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground font-sans">
                تامین: {PersianNumberFormatter.toPersianDigits(oilPct)}٪
              </span>
              <span
                className={`font-bold ${
                  metrics.oilStabilityImpact >= 0 ? "text-gdp" : "text-military"
                }`}
              >
                {metrics.oilStabilityImpact >= 0 ? "+" : ""}
                {PersianNumberFormatter.toPersianDigits(
                  metrics.oilStabilityImpact,
                )}
                ٪ ثبات
              </span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  oilPct >= 100
                    ? "bg-gdp"
                    : oilPct >= 50
                      ? "bg-treasury"
                      : "bg-military"
                }`}
                style={{ width: `${Math.min(100, oilPct)}%` }}
              />
            </div>
          </div>

          <div className="bg-secondary/40 p-3 rounded-xl space-y-1.5 border border-border/40">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-sans">
                <Wrench size={12} className="text-primary" />
                <span>مصرف فولاد صنعتی جمعیت:</span>
              </div>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.toPersianDigits(
                  metrics.steelDemand.toLocaleString("en-US"),
                )}{" "}
                تن / نوبت
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground font-sans">
                تامین: {PersianNumberFormatter.toPersianDigits(steelPct)}٪
              </span>
              <span
                className={`font-bold ${
                  metrics.steelStabilityImpact >= 0
                    ? "text-gdp"
                    : "text-military"
                }`}
              >
                {metrics.steelStabilityImpact >= 0 ? "+" : ""}
                {PersianNumberFormatter.toPersianDigits(
                  metrics.steelStabilityImpact,
                )}
                ٪ ثبات
              </span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  steelPct >= 100
                    ? "bg-gdp"
                    : steelPct >= 50
                      ? "bg-treasury"
                      : "bg-military"
                }`}
                style={{ width: `${Math.min(100, steelPct)}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/30 p-2.5 rounded-xl border border-border/40 font-sans">
          جهت پاسخ‌گویی به تقاضای بالای جمعیت، صنایع کشور را ارتقا دهید، منابع
          جدید از بورس جهانی خریداری کنید یا قلمروهای جدید فتح نمایید.
        </p>
      </div>
    </div>
  );
}
