import React, { useState } from "react";
import { Cpu, Wrench, Zap, Loader2 } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import {
  IndustrialLevelManager,
  InfrastructureManager,
} from "@/engine/economy/economy-calculators";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DevelopmentUpgradesSectionProps {
  nationId: string;
  treasury: number;
  gdp: number;
  industrialLevel: number;
  infrastructureLevel: number;
}

export function DevelopmentUpgradesSection({
  nationId,
  treasury,
  gdp,
  industrialLevel,
  infrastructureLevel,
}: DevelopmentUpgradesSectionProps) {
  const [activeUpgrade, setActiveUpgrade] = useState<string | null>(null);
  const { dispatchAction } = useGameActions();

  const industrialCost = IndustrialLevelManager.getUpgradeCost(gdp);
  const infraCost = InfrastructureManager.getUpgradeCost(gdp);

  const canAffordIndustrial = treasury >= industrialCost;
  const canAffordInfra = treasury >= infraCost;

  const handleUpgrade = async (type: "industrial" | "infra") => {
    if (activeUpgrade) return;
    setActiveUpgrade(type);

    try {
      if (type === "industrial" && canAffordIndustrial) {
        const action = ActionFactory.upgradeIndustrialLevel(nationId);
        await dispatchAction(
          action,
          `پروژه ارتقای سطح صنعت و آموزش به سطح ${industrialLevel + 1} آغاز شد.`,
        );
      } else if (type === "infra" && canAffordInfra) {
        const action = ActionFactory.investInfrastructure(nationId);
        await dispatchAction(
          action,
          `پروژه ارتقای زیرساخت و مسکن به سطح ${infrastructureLevel + 1} کلید خورد.`,
        );
      }
    } finally {
      setActiveUpgrade(null);
    }
  };

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center gap-2 px-1">
        <Cpu size={14} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پروژه‌های توسعه صنعتی و زیرساخت
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
        <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Cpu size={14} className="text-gdp" />
              صنعت و آموزش (سطح{" "}
              {PersianNumberFormatter.toPersianDigits(industrialLevel)})
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {PersianNumberFormatter.formatCurrency(industrialCost)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            افزایش سرعت رشد بهره‌وری سرانه نیروی کار و ارتقای توان تولید صنعتی
            کشور.
          </p>
          <button
            onClick={() => handleUpgrade("industrial")}
            disabled={!canAffordIndustrial || activeUpgrade !== null}
            className="w-full py-2 bg-gdp hover:bg-gdp/90 disabled:opacity-40 text-primary-foreground rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
          >
            {activeUpgrade === "industrial" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            <span>
              {canAffordIndustrial
                ? `ارتقا به سطح ${PersianNumberFormatter.toPersianDigits(industrialLevel + 1)}`
                : "موجودی ناکافی"}
            </span>
          </button>
        </div>

        <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Wrench size={14} className="text-primary" />
              زیرساخت و مسکن (سطح{" "}
              {PersianNumberFormatter.toPersianDigits(infrastructureLevel)})
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {PersianNumberFormatter.formatCurrency(infraCost)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            افزایش ۲۰٪ سقف ظرفیت زیستی و مسکن کشور جهت پذیرش تراکم جمعیت بیشتر.
          </p>
          <button
            onClick={() => handleUpgrade("infra")}
            disabled={!canAffordInfra || activeUpgrade !== null}
            className="w-full py-2 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
          >
            {activeUpgrade === "infra" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            <span>
              {canAffordInfra
                ? `ارتقا به سطح ${PersianNumberFormatter.toPersianDigits(infrastructureLevel + 1)}`
                : "موجودی ناکافی"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
