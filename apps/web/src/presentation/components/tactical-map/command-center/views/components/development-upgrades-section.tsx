import React, { useState } from "react";
import {
  Cpu,
  Zap,
  Loader2,
  TrendingUp,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DevelopmentUpgradesSectionProps {
  nationId: string;
  treasury: number;
  gdp: number;
  developmentLevel: number;
}

export function DevelopmentUpgradesSection({
  nationId,
  treasury,
  gdp,
  developmentLevel,
}: DevelopmentUpgradesSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const upgradeCost = DevelopmentManager.getUpgradeCost(gdp);
  const canAfford = treasury >= upgradeCost;

  const handleUpgrade = async () => {
    if (isSubmitting || !canAfford) return;
    setIsSubmitting(true);

    try {
      const action = ActionFactory.upgradeDevelopment(nationId);
      await dispatchAction(
        action,
        `طرح شکوفایی اقتصادی (سطح ${developmentLevel + 1}) با موفقیت به اجرا درآمد.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-gdp" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            شکوفایی اقتصادی
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded-md">
          سطح {PersianNumberFormatter.toPersianDigits(developmentLevel)}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border/50 font-mono">
          <span className="text-muted-foreground font-sans font-bold text-[11px]">
            هزینه ارتقا به لول{" "}
            {PersianNumberFormatter.toPersianDigits(developmentLevel + 1)} (۴۰٪
            GDP):
          </span>
          <span
            className={`font-extrabold text-xs ${
              canAfford ? "text-gdp" : "text-military"
            }`}
          >
            {PersianNumberFormatter.formatCurrency(upgradeCost)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl space-y-1 text-center sm:text-right">
            <div className="flex items-center gap-1 text-[10px] font-sans text-muted-foreground justify-center sm:justify-start">
              <TrendingUp size={12} className="text-gdp shrink-0" />
              <span className="truncate">نرخ بهره‌وری</span>
            </div>
            <span className="text-xs font-black text-gdp block font-mono">
              +۵٪
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl space-y-1 text-center sm:text-right">
            <div className="flex items-center gap-1 text-[10px] font-sans text-muted-foreground justify-center sm:justify-start">
              <Building2 size={12} className="text-primary shrink-0" />
              <span className="truncate">ظرفیت مسکن</span>
            </div>
            <span className="text-xs font-black text-primary block font-mono">
              +۸٪
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl space-y-1 text-center sm:text-right">
            <div className="flex items-center gap-1 text-[10px] font-sans text-muted-foreground justify-center sm:justify-start">
              <ShieldCheck size={12} className="text-amber-500 shrink-0" />
              <span className="truncate">هزینه ساخت نظامی</span>
            </div>
            <span className="text-xs font-black text-amber-500 block font-mono">
              -۵٪
            </span>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={!canAfford || isSubmitting}
          className="w-full py-3 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          <span>
            {isSubmitting
              ? "در حال اجرای طرح..."
              : canAfford
                ? `ارتقا به سطح ${PersianNumberFormatter.toPersianDigits(developmentLevel + 1)}`
                : "موجودی خزانه ناکافی"}
          </span>
        </button>
      </div>
    </div>
  );
}
