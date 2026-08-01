import React from "react";
import { Cpu, Zap } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { IndustrialLevelManager } from "@/engine/economy/industrial-level-manager";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface IndustrialUpgradeCardProps {
  currentLevel?: number;
  nationId?: string;
  treasury?: number;
  gdp?: number;
}

export function IndustrialUpgradeCard({
  currentLevel = 1,
  nationId = "NATION_118",
  treasury = 100000,
  gdp = 450000000000,
}: IndustrialUpgradeCardProps) {
  const manager = new IndustrialLevelManager();
  const mockNation = {
    gdp,
    industrialLevel: currentLevel,
    treasury,
  } as unknown as Parameters<typeof manager.getUpgradeCost>[0];

  const upgradeCost = manager.getUpgradeCost(mockNation);
  const canAfford = treasury >= upgradeCost;
  const { dispatchAction } = useGameActions();

  const handleUpgrade = async () => {
    if (!canAfford) return;

    const action = ActionFactory.upgradeIndustrialLevel(nationId);
    await dispatchAction(
      action,
      `پروژه ارتقای صنایع سنگین به سطح ${currentLevel + 1} کلید خورد.`,
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Cpu size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          توسعه صنعتی و ظرفیت تولید
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right dir-rtl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">سطح صنعت فعلی:</span>
          <span className="font-mono font-bold text-gdp">
            سطح {PersianNumberFormatter.toPersianDigits(currentLevel)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/40 p-2.5 rounded-xl space-y-1 text-[10px] font-mono">
          <span className="text-muted-foreground block font-sans font-bold">
            مزایای ارتقا به سطح{" "}
            {PersianNumberFormatter.toPersianDigits(currentLevel + 1)}:
          </span>
          <span className="text-gdp font-bold block font-sans">
            • ۲۰+٪ افزایش نرخ تولید نوبتی نفت و فولاد
          </span>
          <span className="text-amber-500 font-bold block font-sans">
            • ۱۰+٪ افزایش بازدهی تولید امتیاز پژوهش در هر چرخه
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans">
            هزینه ارتقا (۱۵٪ GDP):
          </span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.formatCurrency(upgradeCost)}
          </span>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={!canAfford}
          className="w-full py-2.5 bg-gdp hover:bg-gdp/90 disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
        >
          <Zap size={13} />
          <span>
            {canAfford
              ? `ارتقای سطح صنعت (${PersianNumberFormatter.formatCurrency(upgradeCost)})`
              : "خزانه ناکافی جهت ارتقای صنعت"}
          </span>
        </button>
      </div>
    </div>
  );
}
