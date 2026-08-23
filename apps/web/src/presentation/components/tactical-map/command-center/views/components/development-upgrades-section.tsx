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
        `طرح جامع توسعه و نوسازی ملی (سطح ${developmentLevel + 1}) با موفقیت به اجرا درآمد.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-gdp" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            طرح جامع توسعه و نوسازی ملی
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded-lg">
          سطح فعلی: {PersianNumberFormatter.toPersianDigits(developmentLevel)}
        </span>
      </div>

      <div className="bg-background/40 border border-border/70 p-4 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-border/50 font-mono">
          <span className="text-muted-foreground font-sans font-bold">
            هزینه سرمایه‌گذاری طرح (۴۰٪ GDP):
          </span>
          <span
            className={`font-extrabold text-sm ${
              canAfford ? "text-gdp" : "text-military"
            }`}
          >
            {PersianNumberFormatter.formatCurrency(upgradeCost)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-sans text-muted-foreground">
              <TrendingUp size={13} className="text-gdp shrink-0" />
              <span>بهره‌وری کار</span>
            </div>
            <span className="text-xs font-black text-gdp block font-mono">
              +۵٪ رشد آنی
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-sans text-muted-foreground">
              <Building2 size={13} className="text-primary shrink-0" />
              <span>ظرفیت مسکن</span>
            </div>
            <span className="text-xs font-black text-primary block font-mono">
              +۸٪ سقف زیستی
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-sans text-muted-foreground">
              <ShieldCheck size={13} className="text-amber-500 shrink-0" />
              <span>لجستیک دفاعی</span>
            </div>
            <span className="text-xs font-black text-amber-500 block font-mono">
              -۵٪ مخارج ساخت
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/20 p-3 rounded-2xl border border-border/40 font-sans">
          اجرای این طرح با ارتقای هم‌زمان زیرساخت‌های زیستی و صنایع پیشرفته،
          موجب افزایش ۵ درصدی تولید سرانه، گسترش ۸ درصدی ظرفیت مسکن استان‌ها و
          کاهش هزینه‌های نگهداری ارتش می‌گردد.
        </p>

        <button
          onClick={handleUpgrade}
          disabled={!canAfford || isSubmitting}
          className="w-full py-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-bold transition-all shadow-lg shadow-gdp/20 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Zap size={15} />
          )}
          <span>
            {isSubmitting
              ? "در حال اجرای پروژه ملی..."
              : canAfford
                ? `اجرای طرح جامع توسعه (ارتقا به سطح ${PersianNumberFormatter.toPersianDigits(developmentLevel + 1)})`
                : "موجودی خزانه ناکافی جهت تامین بودجه طرح (۴۰٪ GDP)"}
          </span>
        </button>
      </div>
    </div>
  );
}
