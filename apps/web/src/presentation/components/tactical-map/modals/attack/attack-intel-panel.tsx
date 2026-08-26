import React from "react";
import {
  Radio,
  Sparkles,
  Shield,
  ShieldAlert,
  Crosshair,
  Plane,
  Eye,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";

export interface TacticalForecast {
  winProbability: number;
  isVictoryPredicted: boolean;
  isCapitulationPredicted: boolean;
  phase1Prediction: string;
  phase2Prediction: string;
  phase3Prediction: string;
  valuationRatio: number;
}

interface AttackIntelPanelProps {
  isReconActive: boolean;
  reconCost: number;
  canAffordRecon: boolean;
  isExecutingRecon: boolean;
  targetNation: Nation;
  forecast: TacticalForecast;
  onExecuteRecon: () => void;
  onAutoOptimizeDeploy: () => void;
}

export function AttackIntelPanel({
  isReconActive,
  reconCost,
  canAffordRecon,
  isExecutingRecon,
  targetNation,
  forecast,
  onExecuteRecon,
  onAutoOptimizeDeploy,
}: AttackIntelPanelProps) {
  const probColor =
    forecast.winProbability >= 75
      ? "text-gdp"
      : forecast.winProbability >= 50
        ? "text-treasury"
        : "text-military";

  const probBg =
    forecast.winProbability >= 75
      ? "bg-gdp/15 border-gdp/30"
      : forecast.winProbability >= 50
        ? "bg-treasury/15 border-treasury/30"
        : "bg-military/15 border-military/30";

  return (
    <div className="space-y-3 font-sans dir-rtl text-right">
      {!isReconActive ? (
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-3.5 rounded-3xl space-y-3 shadow-md backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25 shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black text-foreground block">
                  مه اطلاعاتی: داده‌های میدانی دقیق پنهان است
                </span>
                <span className="text-[10px] text-muted-foreground block font-sans">
                  برآورد موازنه قوا بر مبنای داده‌های عمومی بین‌المللی (OSINT)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onExecuteRecon}
              disabled={!canAffordRecon || isExecutingRecon}
              className="py-2 px-3.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExecutingRecon ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Radio size={13} className="animate-pulse" />
              )}
              <span>
                شنود ماهواره‌ای فوری (
                {PersianNumberFormatter.formatCurrency(reconCost)})
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 font-mono text-xs">
            <span className="text-[11px] text-muted-foreground font-sans">
              تخمین شانس پیروزی عملیات:
            </span>
            <span
              className={`font-black text-xs px-2.5 py-0.5 rounded-xl border ${probBg} ${probColor}`}
            >
              حدوداً{" "}
              {PersianNumberFormatter.toPersianDigits(forecast.winProbability)}٪
              (خطای اطلاعاتی)
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/25 via-card to-cyan-950/20 border border-emerald-500/40 p-3.5 rounded-3xl space-y-3 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={14} />
              </div>
              <span className="text-xs font-black text-foreground">
                اشراف اطلاعاتی کامل (زرادخانه کشف‌شده {targetNation.name}):
              </span>
            </div>

            <button
              type="button"
              onClick={onAutoOptimizeDeploy}
              className="py-1.5 px-3 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-md shadow-gdp/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles size={13} />
              <span>بهترین آرایش و ترکیب تهاجم</span>
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px]">
            <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
                <Shield size={10} className="text-primary" />
                <span>پیاده‌نظام</span>
              </div>
              <span className="font-extrabold text-foreground block">
                {PersianNumberFormatter.toPersianDigits(
                  (targetNation.military.infantry || 0).toLocaleString("en-US"),
                )}
              </span>
            </div>

            <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
                <ShieldAlert size={10} className="text-military" />
                <span>زرهی</span>
              </div>
              <span className="font-extrabold text-foreground block">
                {PersianNumberFormatter.toPersianDigits(
                  (targetNation.military.armor || 0).toLocaleString("en-US"),
                )}
              </span>
            </div>

            <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
                <Crosshair size={10} className="text-diplomacy" />
                <span>پدافند</span>
              </div>
              <span className="font-extrabold text-foreground block">
                {PersianNumberFormatter.toPersianDigits(
                  (targetNation.military.airDefense || 0).toLocaleString(
                    "en-US",
                  ),
                )}
              </span>
            </div>

            <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
                <Plane size={10} className="text-gdp" />
                <span>جنگنده</span>
              </div>
              <span className="font-extrabold text-foreground block">
                {PersianNumberFormatter.toPersianDigits(
                  (targetNation.military.airForce || 0).toLocaleString("en-US"),
                )}
              </span>
            </div>

            <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
                <Radio size={10} className="text-treasury" />
                <span>موشک</span>
              </div>
              <span className="font-extrabold text-foreground block">
                {PersianNumberFormatter.toPersianDigits(
                  (targetNation.military.droneMissile || 0).toLocaleString(
                    "en-US",
                  ),
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-sans">
                برآورد ۳ فاز:
              </span>
              <span className="text-[10px] text-foreground font-sans bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/50">
                {forecast.isCapitulationPredicted
                  ? "تسلیم کامل و الحاق قطعی"
                  : forecast.isVictoryPredicted
                    ? "پیروزی تاکتیکی و فتح منطقه"
                    : "ریسک بالای شکست زمینی"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-sans">
                شانس پیروزی قطعی:
              </span>
              <span
                className={`font-black text-xs px-2.5 py-0.5 rounded-xl border ${probBg} ${probColor}`}
              >
                {PersianNumberFormatter.toPersianDigits(
                  forecast.winProbability,
                )}
                ٪
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
