import React, { useState, useMemo } from "react";
import { Coins, TrendingUp, Zap, Anchor, Compass, Globe } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";
import { TariffCalculator } from "@/engine/economy/calculators/tariff-calculator";
import { CountryRegistry } from "@/domain/data/countries";

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

  const tariffRate = userTariffRate ?? initialTariffRate;

  const handleApplyTariff = async () => {
    const action = ActionFactory.setTariffRate(nationId, tariffRate);
    await dispatchAction(
      action,
      `تعرفه تجاری گمرک بر روی ${PersianNumberFormatter.toPersianDigits(tariffRate)}٪ تنظیم گردید.`,
    );
  };

  const currentNationState = useMemo<Nation>(() => {
    if (nation) {
      return { ...nation, tariffRate };
    }
    const cleanId = CountryRegistry.resolveCanonicalId(nationId);
    return {
      id: cleanId,
      name: "کشور",
      isAi: false,
      isAlive: true,
      flagCode: "IR",
      rank: 1,
      perCapitaProductivity: Math.floor(gdp / 80000000),
      maxPopulationCapacity: 100000000,
      taxRate: 15,
      tariffRate,
      treasury: 100000,
      nationalDebt: 0,
      population: 80000000,
      industrialLevel: 1,
      government: { type: "DEMOCRACY", stability: 80, turnsInPower: 1 },
      military: {
        infantry: 10,
        armor: 0,
        airDefense: 0,
        airForce: 0,
        droneMissile: 0,
        navalFleet: 0,
        experience: 0,
        techLevel: 1,
      },
      recruitmentQueue: [],
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess,
        territoryPixelCount: 1000,
        infrastructureLevel: 1,
      },
      relations: {},
      activeModifiers: [],
      globalReputation: 50,
      doctrines: { unlockedDoctrines },
      provinceIds: [],
      executedEspionageTiers: [],
      warFocusTargetId: null,
    };
  }, [nation, nationId, tariffRate, gdp, hasSeaAccess, unlockedDoctrines]);

  const tariffCalculation = useMemo(() => {
    return TariffCalculator.calculateTariffEffects(
      currentNationState,
      nationsMap,
    );
  }, [currentNationState, nationsMap]);

  const isSeaAccessible = currentNationState.geography.hasSeaAccess;

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
                محشور در خشکی (-۵۰٪)
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

        <PercentageSelector
          options={[
            { pct: 0, label: "تجارت آزاد (۰٪)" },
            { pct: 0.1, label: "متعادل (۱۰٪)" },
            { pct: 0.25, label: "حمایتی (۲۵٪)" },
            { pct: 0.5, label: "جنگ تجاری (۵۰٪)", isMax: true },
          ]}
          onSelect={(pct) => setUserTariffRate(Math.round(pct * 100))}
          colorVariant="gdp"
        />

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
                {PersianNumberFormatter.formatCurrency(
                  tariffCalculation.tariffRevenue,
                )}
              </span>
            </div>

            <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                نوسان ثبات نوبتی:
              </span>
              <span
                className={`font-bold text-[11px] ${
                  tariffCalculation.stabilityImpact > 0
                    ? "text-gdp"
                    : tariffCalculation.stabilityImpact < 0
                      ? "text-military"
                      : "text-foreground"
                }`}
              >
                {tariffCalculation.stabilityImpact > 0 ? "+" : ""}
                {PersianNumberFormatter.toPersianDigits(
                  tariffCalculation.stabilityImpact,
                )}
                ٪
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
                tariffCalculation.tradeVolumePercentage,
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
