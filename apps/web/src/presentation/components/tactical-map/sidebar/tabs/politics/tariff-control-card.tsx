import React, { useState, useMemo } from "react";
import { Coins, Zap, Anchor, Compass, Globe } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { TariffCalculator } from "@/engine/economy/calculators/tariff-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { TaxSlider } from "@/presentation/components/tactical-map/sidebar/tabs/politics/components/tax-slider";

export interface TariffPolicyTier {
  rate: number;
  label: string;
  badge: string;
}

export const TARIFF_POLICY_TIERS: TariffPolicyTier[] = [
  {
    rate: 0,
    label: "تجارت آزاد و مرزهای باز",
    badge: "تجارت آزاد",
  },
  {
    rate: 10,
    label: "تعرفه متعادل حمایتی",
    badge: "پایه و متعادل",
  },
  {
    rate: 25,
    label: "حمایت‌گرایی از تولید داخل",
    badge: "حمایت‌گرایی",
  },
  {
    rate: 35,
    label: "سیاست انقباضی و سهمیه‌بندی",
    badge: "گمرک انقباضی",
  },
  {
    rate: 50,
    label: "جنگ تجاری و مرکانتیلیسم",
    badge: "جنگ تجاری",
  },
];

const TARIFF_TIER_RATES = TARIFF_POLICY_TIERS.map((t) => t.rate);

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

  const currentPolicy =
    TARIFF_POLICY_TIERS.find((t) => t.rate === tariffRate) ||
    TARIFF_POLICY_TIERS.reduce((best, item) =>
      Math.abs(item.rate - tariffRate) < Math.abs(best.rate - tariffRate)
        ? item
        : best,
    );

  const handleApplyTariff = async () => {
    const action = ActionFactory.setTariffRate(nationId, tariffRate);
    await dispatchAction(
      action,
      `سیاست گمرکی ${currentPolicy.label} (${PersianNumberFormatter.toPersianDigits(tariffRate)}٪) به اجرا درآمد.`,
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
    <div className="space-y-2.5 font-sans dir-rtl text-right">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Coins size={13} className="text-gdp" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            تنظیمات تعرفه گمرک و سیاست تجاری
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isSeaAccessible ? (
            <span className="text-[9px] font-bold font-sans text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Anchor size={10} />
              ساحلی (۱۰۰٪)
            </span>
          ) : (
            <span className="text-[9px] font-bold font-sans text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Compass size={10} />
              محصور در خشکی (-۵۰٪)
            </span>
          )}
        </div>
      </div>

      <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3">
        <div className="bg-secondary/40 border border-border/50 px-3 py-2 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            {currentPolicy.label}
          </span>
          <span className="text-xs font-mono font-black text-gdp">
            {PersianNumberFormatter.toPersianDigits(tariffRate)}٪
          </span>
        </div>

        <TaxSlider
          currentRate={tariffRate}
          tiers={TARIFF_TIER_RATES}
          onSelectRate={(rate) => setUserTariffRate(rate)}
        />

        <div className="bg-secondary/40 border border-border/60 p-3 rounded-xl space-y-2 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
              <span className="text-muted-foreground block font-sans text-[9px]">
                درآمد گمرکی نوبتی:
              </span>
              <span className="font-bold text-gdp text-xs block truncate">
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
                className={`font-bold text-xs block ${
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
              شرکای تجاری فعال:
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
          <Zap size={13} />
          <span>
            اعمال سیاست گمرکی (
            {PersianNumberFormatter.toPersianDigits(tariffRate)}٪)
          </span>
        </button>
      </div>
    </div>
  );
}
