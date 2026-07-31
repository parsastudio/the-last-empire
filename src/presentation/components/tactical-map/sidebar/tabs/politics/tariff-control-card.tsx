import React, { useState } from "react";
import { Coins, TrendingUp, Zap, Anchor, Compass } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface TariffControlCardProps {
  initialTariffRate?: number;
  nationId?: string;
  hasSeaAccess?: boolean;
}

export function TariffControlCard({
  initialTariffRate = 10,
  nationId = "NATION_118",
  hasSeaAccess = true,
}: TariffControlCardProps) {
  const [tariffRate, setTariffRate] = useState<number>(initialTariffRate);
  const [prevInitialTariff, setPrevInitialTariff] =
    useState<number>(initialTariffRate);
  const { dispatchAction } = useGameActions();

  if (initialTariffRate !== prevInitialTariff) {
    setPrevInitialTariff(initialTariffRate);
    setTariffRate(initialTariffRate);
  }

  const handleApplyTariff = async () => {
    const action = ActionFactory.setTariffRate(nationId, tariffRate);
    await dispatchAction(
      action,
      `تعرفه تجاری گمرک بر روی ${PersianNumberFormatter.toPersianDigits(tariffRate)}٪ تنظیم گردید.`,
    );
  };

  const tradeVolumeFactor = Math.max(
    0.05,
    1.0 - Math.pow(tariffRate / 100, 1.1),
  );
  const tradeVolumePercentage = Math.round(tradeVolumeFactor * 100);

  const gdpGrowthPenalty = Number(
    (((tariffRate / 100) * 0.038 - 0.008) * 100).toFixed(2),
  );
  const stabilityImpact = Number(((10 - tariffRate) * 0.08).toFixed(2));

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Coins size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تنظیمات تعرفه گمرک و سیاست تجاری
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-extrabold text-foreground text-sm">
            {PersianNumberFormatter.toPersianDigits(tariffRate)}٪
          </span>
          <div className="flex items-center gap-2">
            {hasSeaAccess ? (
              <span className="text-[9px] font-bold font-sans text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Anchor size={11} />
                ساحلی (۱۰۰٪)
              </span>
            ) : (
              <span className="text-[9px] font-bold font-sans text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Compass size={11} />
                محصور در خشکی (-۵۰٪)
              </span>
            )}
            <span className="text-muted-foreground">نرخ تعرفه گمرک</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="50"
          value={tariffRate}
          onChange={(e) => setTariffRate(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <div className="grid grid-cols-4 gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setTariffRate(0)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              tariffRate === 0
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/60 hover:bg-secondary border-border/60 text-muted-foreground"
            }`}
          >
            تجارت آزاد (۰٪)
          </button>
          <button
            type="button"
            onClick={() => setTariffRate(10)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              tariffRate === 10
                ? "bg-gdp text-primary-foreground border-gdp"
                : "bg-secondary/60 hover:bg-secondary border-border/60 text-muted-foreground"
            }`}
          >
            متعادل (۱۰٪)
          </button>
          <button
            type="button"
            onClick={() => setTariffRate(25)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              tariffRate === 25
                ? "bg-treasury text-primary-foreground border-treasury"
                : "bg-secondary/60 hover:bg-secondary border-border/60 text-muted-foreground"
            }`}
          >
            حمایتی (۲۵٪)
          </button>
          <button
            type="button"
            onClick={() => setTariffRate(50)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              tariffRate === 50
                ? "bg-military text-primary-foreground border-military"
                : "bg-secondary/60 hover:bg-secondary border-border/60 text-muted-foreground"
            }`}
          >
            جنگ تجاری (۵۰٪)
          </button>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3 rounded-xl space-y-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 font-sans font-bold text-muted-foreground">
            <TrendingUp size={12} className="text-gdp" />
            <span>پیش‌بینی اثرات گمرک ملی</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-background/60 p-2 rounded-lg space-y-0.5 border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                حجم تجارت فعال:
              </span>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.toPersianDigits(tradeVolumePercentage)}٪
              </span>
            </div>

            <div className="bg-background/60 p-2 rounded-lg space-y-0.5 border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                اثر بر رشد GDP:
              </span>
              <span
                className={`font-bold ${
                  gdpGrowthPenalty > 0
                    ? "text-military"
                    : gdpGrowthPenalty < 0
                      ? "text-gdp"
                      : "text-foreground"
                }`}
              >
                {gdpGrowthPenalty < 0 ? "+" : "-"}
                {PersianNumberFormatter.toPersianDigits(
                  Math.abs(gdpGrowthPenalty),
                )}
                ٪
              </span>
            </div>

            <div className="bg-background/60 p-2 rounded-lg space-y-0.5 border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                نوسان ثبات نوبتی:
              </span>
              <span
                className={`font-bold ${
                  stabilityImpact > 0
                    ? "text-gdp"
                    : stabilityImpact < 0
                      ? "text-military"
                      : "text-foreground"
                }`}
              >
                {stabilityImpact > 0 ? "+" : ""}
                {PersianNumberFormatter.toPersianDigits(stabilityImpact)}٪
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleApplyTariff}
          className="w-full py-2.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Zap size={14} />
          <span>
            اعمال سیاست گمرکی (
            {PersianNumberFormatter.toPersianDigits(tariffRate)}٪)
          </span>
        </button>
      </div>
    </div>
  );
}
