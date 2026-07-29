import React from "react";
import { Wrench } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

interface InfrastructureUpgradeCardProps {
  currentLevel?: number;
  nationId?: string;
  treasury?: number;
}

export function InfrastructureUpgradeCard({
  currentLevel = 1,
  nationId = "NATION_118",
  treasury = 100000,
}: InfrastructureUpgradeCardProps) {
  const upgradeCost = Math.floor(30000 * Math.pow(1.25, currentLevel - 1));
  const canAfford = treasury >= upgradeCost;
  const { dispatchAction } = useGameActions();

  const handleUpgradeInfra = async () => {
    if (!canAfford) return;

    const action = ActionFactory.investInfrastructure(nationId);
    await dispatchAction(
      action,
      `پروژه نوسازی شبکه مواصلاتی مرزی به سطح ${currentLevel + 1} آغاز شد.`,
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Wrench size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          زیرساخت‌ها و مواصلات سرزمینی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right dir-rtl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">سطح زیرساخت فعلی:</span>
          <span className="font-mono font-bold text-primary">
            سطح {currentLevel}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans">هزینه نوسازی:</span>
          <span className="font-bold text-foreground">
            ${upgradeCost.toLocaleString("fa-IR")}
          </span>
        </div>

        <button
          onClick={handleUpgradeInfra}
          disabled={!canAfford}
          className="w-full py-2 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
        >
          {canAfford
            ? `نوسازی زیرساخت مرزی (سطح ${currentLevel + 1})`
            : "خزانه ناکافی جهت نوسازی زیرساخت"}
        </button>
      </div>
    </div>
  );
}
