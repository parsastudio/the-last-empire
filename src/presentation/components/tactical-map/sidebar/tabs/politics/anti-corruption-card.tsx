import React, { useState } from "react";
import { ShieldCheck, Zap } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface AntiCorruptionCardProps {
  nationId?: string;
  treasury?: number;
  gdp?: number;
  currentCorruption?: number;
}

export function AntiCorruptionCard({
  nationId = "NATION_118",
  treasury = 100000,
  gdp = 450000000000,
  currentCorruption = 10,
}: AntiCorruptionCardProps) {
  const maxReducible = Math.min(
    100,
    Math.max(1, Math.round(currentCorruption)),
  );
  const [targetReduction, setTargetReduction] = useState<number>(
    Math.min(5, maxReducible),
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [prevMax, setPrevMax] = useState<number>(maxReducible);

  if (maxReducible !== prevMax) {
    setPrevMax(maxReducible);
    if (targetReduction > maxReducible) {
      setTargetReduction(maxReducible);
    }
  }

  const antiCorruptionCost = Math.floor(gdp * (targetReduction / 100));
  const canAfford = treasury >= antiCorruptionCost;
  const { dispatchAction } = useGameActions();

  const handleAntiCorruption = async () => {
    if (!canAfford || targetReduction <= 0) return;

    const action = ActionFactory.antiCorruptionDrive(
      nationId,
      antiCorruptionCost,
    );
    await dispatchAction(
      action,
      `مبلغ ${PersianNumberFormatter.formatCurrency(antiCorruptionCost)} به آژانس بازرسی ملی تزریق شد و شاخص فساد اداری ${PersianNumberFormatter.toPersianDigits(targetReduction)}٪ کاهش یافت.`,
    );
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetReduction(Number(e.target.value));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پروژه‌های مبارزه با فساد
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5 dir-rtl text-right">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-extrabold text-foreground text-sm">
            {PersianNumberFormatter.toPersianDigits(targetReduction)}٪
          </span>
          <span className="text-muted-foreground font-sans">
            کاهش درخواستی فساد
          </span>
        </div>

        <div className="space-y-2">
          <div className="relative w-full flex items-center h-6">
            <div className="absolute w-full h-2 bg-secondary rounded-lg overflow-hidden">
              <div
                className="absolute top-0 h-full bg-gdp transition-all duration-75 right-0"
                style={{
                  width: `${(targetReduction / Math.max(1, maxReducible)) * 100}%`,
                  transition: isDragging ? "none" : "width 0.1s ease-out",
                }}
              />
            </div>

            <input
              type="range"
              min="1"
              max={maxReducible}
              value={targetReduction}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-transparent rounded-lg appearance-none relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gdp [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gdp [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-card [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-0.5">
            <span>۱٪</span>
            <span>مدیریت تعادل</span>
            <span>
              {PersianNumberFormatter.toPersianDigits(maxReducible)}٪ (پاکسازی
              کامل)
            </span>
          </div>
        </div>

        <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            هزینه محاسبه‌شده:
          </span>
          <span className="font-bold text-gdp">
            {PersianNumberFormatter.formatCurrency(antiCorruptionCost)}
          </span>
        </div>

        <button
          onClick={handleAntiCorruption}
          disabled={!canAfford || targetReduction <= 0}
          className="w-full py-2.5 bg-gdp hover:bg-gdp/90 disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Zap size={14} />
          <span>
            {canAfford
              ? `تزریق بودجه ضدفساد (-${PersianNumberFormatter.toPersianDigits(targetReduction)}٪ فساد)`
              : "خزانه ناکافی جهت طرح ضدفساد"}
          </span>
        </button>
      </div>
    </div>
  );
}
