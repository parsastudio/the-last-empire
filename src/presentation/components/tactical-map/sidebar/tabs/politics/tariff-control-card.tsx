import React, { useState, useMemo } from "react";
import { Coins, TrendingUp, Zap, Anchor, Compass, Globe } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { Nation } from "@/domain/nation/nation.schema";

interface TariffControlCardProps {
  initialTariffRate?: number;
  nationId: string;
  hasSeaAccess?: boolean;
  gdp?: number;
  unlockedDoctrines?: string[];
  nationsMap?: Record<string, Nation>;
  nation?: Nation;
}

export function TariffControlCard({
  initialTariffRate = 10,
  nationId,
  hasSeaAccess = true,
  gdp = 450000000000,
  unlockedDoctrines = [],
  nationsMap,
  nation,
}: TariffControlCardProps) {
  const [userTariffRate, setUserTariffRate] = useState<number | null>(null);
  const { dispatchAction } = useGameActions();
  const doctrinesManager = useMemo(() => new DoctrinesManager(), []);

  const tariffRate = userTariffRate ?? initialTariffRate;

  const handleApplyTariff = async () => {
    const action = ActionFactory.setTariffRate(nationId, tariffRate);
    await dispatchAction(
      action,
      `تعرفه تجاری گمرک بر روی ${PersianNumberFormatter.toPersianDigits(tariffRate)}٪ تنظیم گردید.`,
    );
  };

  const activeTradeRatio = useMemo(() => {
    const currentNation = nation || (nationsMap ? nationsMap[nationId] : null);
    if (!nationsMap || !currentNation) return 1.0;

    const otherAliveNations = Object.values(nationsMap).filter(
      (n) => n.id !== currentNation.id && n.isAlive,
    );
    if (otherAliveNations.length === 0) return 1.0;

    let activeCount = 0;
    for (const partner of otherAliveNations) {
      const rel = currentNation.relations?.[partner.id];
      const isSevered =
        rel?.stance === "SEVERED_RELATIONS" || rel?.isTradeEmbargoed === true;
      if (!isSevered) {
        activeCount++;
      }
    }

    return activeCount / otherAliveNations.length;
  }, [nationsMap, nation, nationId]);

  const effectiveGdp = nation?.gdp ?? gdp;
  const isSeaAccessible = nation?.geography?.hasSeaAccess ?? hasSeaAccess;
  const seaAccessFactor = isSeaAccessible ? 1.0 : 0.5;
  const effectiveDoctrines =
    nation?.doctrines?.unlockedDoctrines ?? unlockedDoctrines;

  const tradeVolumeFactor = Math.max(
    0.05,
    1.0 - Math.pow(tariffRate / 100, 1.1),
  );

  const baseTradeBase =
    effectiveGdp * 0.15 * seaAccessFactor * activeTradeRatio;
  const effectiveTradeValue = baseTradeBase * tradeVolumeFactor;
  const researchMultiplier =
    doctrinesManager.getTariffRevenueMultiplier(effectiveDoctrines);

  const projectedTariffRevenue = Math.floor(
    effectiveTradeValue * (tariffRate / 100) * researchMultiplier,
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
            {isSeaAccessible ? (
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
          onChange={(e) => setUserTariffRate(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <div className="grid grid-cols-4 gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setUserTariffRate(0)}
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
            onClick={() => setUserTariffRate(10)}
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
            onClick={() => setUserTariffRate(25)}
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
            onClick={() => setUserTariffRate(50)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              tariffRate === 50
                ? "bg-military text-primary-foreground border-military"
                : "bg-secondary/60 hover:bg-secondary border-border/60 text-muted-foreground"
            }`}
          >
            جنگ تجاری (۵۰٪)
          </button>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 font-sans font-bold text-muted-foreground text-[10px]">
            <TrendingUp size={12} className="text-gdp" />
            <span>پایش زنده اثرات گمرک ملی</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                درآمد گمرکی نوبتی:
              </span>
              <span className="font-bold text-gdp text-[11px]">
                {PersianNumberFormatter.formatCurrency(projectedTariffRevenue)}
              </span>
            </div>

            <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                نوسان ثبات نوبتی:
              </span>
              <span
                className={`font-bold text-[11px] ${
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

          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans pt-1 border-t border-border/30">
            <span className="flex items-center gap-1">
              <Globe size={11} className="text-primary" />
              شرکای تجاری فعال (غیرتحریمی):
            </span>
            <span className="font-bold text-foreground font-mono">
              {PersianNumberFormatter.toPersianDigits(
                Math.round(activeTradeRatio * 100),
              )}
              ٪
            </span>
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
