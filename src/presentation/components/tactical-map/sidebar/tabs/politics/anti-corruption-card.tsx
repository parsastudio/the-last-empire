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
  currentCorruption = 0,
}: AntiCorruptionCardProps) {
  const roundedCorruption = Math.round(currentCorruption);
  const maxReducible = Math.max(1, Math.min(100, roundedCorruption));

  const [targetReduction, setTargetReduction] = useState<number>(
    Math.min(5, maxReducible),
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [prevMax, setPrevMax] = useState<number>(maxReducible);

  if (maxReducible !== prevMax) {
    setPrevMax(maxReducible);
    setTargetReduction(Math.min(5, maxReducible));
  }

  const antiCorruptionCost = Math.floor(gdp * (targetReduction / 100));
  const canAfford = treasury >= antiCorruptionCost;
  const { dispatchAction } = useGameActions();

  const handleAntiCorruption = async () => {
    if (!canAfford || targetReduction <= 0 || roundedCorruption <= 0) return;

    const action = ActionFactory.antiCorruptionDrive(
      nationId,
      antiCorruptionCost,
    );
    await dispatchAction(
      action,
      `مبلغ ${PersianNumberFormatter.formatCurrency(antiCorruptionCost)} به آژانس بازرسی ملی تزریق شد و شاخص فساد اداری ${PersianNumberFormatter.toPersianDigits(targetReduction)}٪ کاهش یافت.`,
    );
  };

  const handlePercentageSelect = (percentage: number) => {
    if (maxReducible <= 0) return;
    const target = Math.max(1, Math.floor(maxReducible * percentage));
    setTargetReduction(target);
  };

  const resultingCorruption = Math.max(0, roundedCorruption - targetReduction);

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پروژه‌های مبارزه با فساد اداری
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            شاخص فعلی فساد:
          </span>
          <span className="font-bold text-military text-sm">
            {PersianNumberFormatter.toPersianDigits(roundedCorruption)}٪
          </span>
        </div>

        {roundedCorruption <= 0 ? (
          <div className="p-3 bg-gdp/10 border border-gdp/30 rounded-xl text-center text-xs font-bold text-gdp">
            فساد اداری در کشور به طور کامل ریشه‌کن شده است.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-sans">
                  میزان کاهش درخواستی:
                </span>
                <span className="font-mono font-extrabold text-gdp text-xs">
                  -{PersianNumberFormatter.toPersianDigits(targetReduction)}٪
                  (نهایی:{" "}
                  {PersianNumberFormatter.toPersianDigits(resultingCorruption)}
                  ٪)
                </span>
              </div>

              <div className="relative w-full flex items-center h-6">
                <div className="absolute w-full h-2 bg-secondary rounded-lg overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-gdp transition-all duration-75 right-0"
                    style={{
                      width: `${(targetReduction / maxReducible) * 100}%`,
                      transition: isDragging ? "none" : "width 0.1s ease-out",
                    }}
                  />
                </div>

                <input
                  type="range"
                  min="1"
                  max={maxReducible}
                  value={targetReduction}
                  onChange={(e) => setTargetReduction(Number(e.target.value))}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-transparent rounded-lg appearance-none relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gdp [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gdp [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-card [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => handlePercentageSelect(0.25)}
                  className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  ۲۵٪
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageSelect(0.5)}
                  className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  ۵۰٪
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageSelect(0.75)}
                  className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  ۷۵٪
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageSelect(1.0)}
                  className="py-1 rounded-lg bg-gdp/20 hover:bg-gdp/30 border border-gdp/40 text-[9px] font-mono font-bold text-gdp transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Zap size={10} />
                  <span>۱۰۰٪ (پاکسازی)</span>
                </button>
              </div>
            </div>

            <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground font-sans">
                هزینه محاسباتی طرح:
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
                  : "خزانه ناکافی جهت اجرای طرح ضدفساد"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
