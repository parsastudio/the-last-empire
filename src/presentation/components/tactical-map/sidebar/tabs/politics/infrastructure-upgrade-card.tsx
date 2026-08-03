import React, { useState } from "react";
import { Wrench, Zap, Loader2 } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { InfrastructureManager } from "@/engine/economy/infrastructure-manager";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface InfrastructureUpgradeCardProps {
  currentLevel?: number;
  nationId: string;
  treasury?: number;
  gdp?: number;
}

export function InfrastructureUpgradeCard({
  currentLevel = 1,
  nationId,
  treasury = 100000,
  gdp = 450000000000,
}: InfrastructureUpgradeCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const manager = new InfrastructureManager();
  const mockNation = {
    gdp,
    geography: { infrastructureLevel: currentLevel },
  } as unknown as Parameters<typeof manager.getUpgradeCost>[0];

  const upgradeCost = manager.getUpgradeCost(mockNation);
  const canAfford = treasury >= upgradeCost;
  const { dispatchAction } = useGameActions();

  const handleUpgradeInfra = async () => {
    if (!canAfford || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const action = ActionFactory.investInfrastructure(nationId);
      await dispatchAction(
        action,
        `پروژه نوسازی شبکه مواصلاتی مرزی به سطح ${currentLevel + 1} آغاز شد و GDP کشور افزایش یافت.`,
      );
    } finally {
      setIsSubmitting(false);
    }
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
            سطح {PersianNumberFormatter.toPersianDigits(currentLevel)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/40 p-2.5 rounded-xl text-xs font-mono">
          <span className="text-gdp font-bold block font-sans">
            +۲ درصد رشد GDP
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans">هزینه نوسازی:</span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.formatCurrency(upgradeCost)}
          </span>
        </div>

        <button
          onClick={handleUpgradeInfra}
          disabled={!canAfford || isSubmitting}
          className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Zap size={13} />
          )}
          <span>
            {isSubmitting
              ? "در حال ثبت نوسازی..."
              : canAfford
                ? `نوسازی زیرساخت (${PersianNumberFormatter.formatCurrency(upgradeCost)})`
                : "خزانه ناکافی جهت نوسازی زیرساخت"}
          </span>
        </button>
      </div>
    </div>
  );
}
