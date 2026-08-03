import React, { useState } from "react";
import { Globe, Zap, Loader2 } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DiplomaticCampaignCardProps {
  nationId: string;
  treasury?: number;
  gdp?: number;
  currentReputation?: number;
}

export function DiplomaticCampaignCard({
  nationId,
  treasury = 100000,
  gdp = 450000000000,
  currentReputation = 50,
}: DiplomaticCampaignCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const campaignCost = Math.floor(gdp * 0.05);
  const canAfford = treasury >= campaignCost;
  const { dispatchAction } = useGameActions();

  const handleLaunchCampaign = async () => {
    if (!canAfford || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const action = ActionFactory.investDiplomacy(nationId, campaignCost);
      await dispatchAction(
        action,
        `پویش دیپلماتیک بین‌المللی با هزینه ${PersianNumberFormatter.formatCurrency(campaignCost)} اجرا شد و پرستیژ جهانی ۱۵ واحد ارتقا یافت.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Globe size={13} className="text-diplomacy" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پویش دیپلماتیک و پرستیژ جهانی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            اعتبار جهانی فعلی:
          </span>
          <span
            className={`font-bold ${
              currentReputation >= 50
                ? "text-gdp"
                : currentReputation >= 0
                  ? "text-treasury"
                  : "text-military"
            }`}
          >
            {currentReputation > 0 ? "+" : ""}
            {PersianNumberFormatter.toPersianDigits(currentReputation)} / ۱۰۰
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl space-y-1 text-[10px] font-mono">
          <span className="text-muted-foreground block font-sans font-bold">
            مزایای پویش بین‌المللی:
          </span>
          <span className="text-gdp font-bold block font-sans">
            • ۱۵+ واحد ارتقای فوری پرستیژ و جایگاه جهانی کشور
          </span>
          <span className="text-muted-foreground block font-sans">
            • هزینه محاسباتی: ۵٪ از تولید ناخالص (GDP)
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans">
            هزینه پویش (۵٪ GDP):
          </span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.formatCurrency(campaignCost)}
          </span>
        </div>

        <button
          onClick={handleLaunchCampaign}
          disabled={!canAfford || currentReputation >= 100 || isSubmitting}
          className="w-full py-2.5 bg-diplomacy hover:bg-diplomacy/90 disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          <span>
            {isSubmitting
              ? "در حال اجرای پویش..."
              : currentReputation >= 100
                ? "پرستیژ جهانی در حداکثر سقف ممکن (۱۰۰) قرار دارد"
                : canAfford
                  ? `اجرای پویش دیپلماتیک (${PersianNumberFormatter.formatCurrency(campaignCost)})`
                  : "خزانه ناکافی جهت اجرای پویش دیپلماتیک"}
          </span>
        </button>
      </div>
    </div>
  );
}
