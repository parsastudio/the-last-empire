import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface AntiCorruptionCardProps {
  nationId?: string;
  treasury?: number;
  gdp?: number;
}

export function AntiCorruptionCard({
  nationId = "NATION_118",
  treasury = 100000,
  gdp = 450000000000,
}: AntiCorruptionCardProps) {
  const [targetReduction, setTargetReduction] = useState<number>(5);
  const antiCorruptionCost = Math.floor(gdp * (targetReduction / 100));
  const canAfford = treasury >= antiCorruptionCost;
  const { dispatchAction } = useGameActions();

  const handleAntiCorruption = async () => {
    if (!canAfford) return;

    const action = ActionFactory.antiCorruptionDrive(
      nationId,
      antiCorruptionCost,
    );
    await dispatchAction(
      action,
      `مبلغ ${PersianNumberFormatter.formatCurrency(antiCorruptionCost)} به آژانس بازرسی ملی تزریق شد و شاخص فساد اداری ${PersianNumberFormatter.toPersianDigits(targetReduction)}٪ کاهش یافت.`,
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پروژه‌های مبارزه با فساد
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            میزان کاهش انتخابی فساد:
          </span>
          <div className="flex items-center gap-1 font-bold text-gdp">
            <button
              onClick={() => setTargetReduction(1)}
              className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${targetReduction === 1 ? "bg-gdp text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              ۱٪
            </button>
            <button
              onClick={() => setTargetReduction(5)}
              className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${targetReduction === 5 ? "bg-gdp text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              ۵٪
            </button>
            <button
              onClick={() => setTargetReduction(10)}
              className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${targetReduction === 10 ? "bg-gdp text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              ۱۰٪
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            هزینه اجرا (
            {PersianNumberFormatter.toPersianDigits(targetReduction)}٪ GDP):
          </span>
          <span className="font-bold text-gdp">
            {PersianNumberFormatter.formatCurrency(antiCorruptionCost)}
          </span>
        </div>

        <button
          onClick={handleAntiCorruption}
          disabled={!canAfford}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
        >
          {canAfford
            ? `تزریق بودجه ضدفساد (-${PersianNumberFormatter.toPersianDigits(targetReduction)}٪ فساد)`
            : "خزانه ناکافی جهت طرح ضدفساد"}
        </button>
      </div>
    </div>
  );
}
