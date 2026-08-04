import React, { useState } from "react";
import { Landmark, TrendingUp, ShieldAlert } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

function TaxSlider({
  taxRate,
  isDragging,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  taxRate: number;
  isDragging: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div className="space-y-2">
      <div dir="rtl" className="relative w-full flex items-center h-6">
        <div className="absolute w-full h-2 bg-secondary rounded-lg overflow-hidden">
          <div
            className="absolute top-0 h-full bg-gdp transition-all duration-75 right-0"
            style={{
              width: `${(taxRate / 50) * 100}%`,
              transition: isDragging ? "none" : "width 0.1s ease-out",
            }}
          />
        </div>

        <input
          type="range"
          min="0"
          max="50"
          value={taxRate}
          onChange={onChange}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-transparent rounded-lg appearance-none relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gdp [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gdp [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-card [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-0.5">
        <span>0% (آزاد)</span>
        <span>25% (متعادل)</span>
        <span>50% (حداکثری)</span>
      </div>
    </div>
  );
}

function PredictiveImpactBox({
  newTaxRate,
  baseGdp,
  corruption = 0,
}: {
  newTaxRate: number;
  baseGdp: number;
  corruption?: number;
}) {
  const clampedRate = Math.min(50, Math.max(0, newTaxRate));
  const grossTax = baseGdp * (clampedRate / 100);
  const corruptionLoss = grossTax * (corruption / 100);
  const projectedIncome = Math.floor(grossTax - corruptionLoss);

  const stabilityImpact = Number(((15 - clampedRate) * 0.2).toFixed(2));

  return (
    <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs dir-rtl text-right">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
        <TrendingUp size={13} className="text-gdp" />
        <span>پایش زنده اثرات مالیاتی</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            درآمد مالیاتی نوبتی:
          </span>
          <span className="font-bold text-gdp text-[11px]">
            {PersianNumberFormatter.formatCurrency(projectedIncome)}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            نوسان ثبات نوبتی:
          </span>
          <span
            className={`font-bold text-[11px] ${
              stabilityImpact > 0
                ? "text-gdp"
                : stabilityImpact < 0
                  ? "text-military"
                  : "text-foreground"
            }`}
          >
            {stabilityImpact > 0 ? "+" : ""}
            {PersianNumberFormatter.toPersianDigits(stabilityImpact)}٪
          </span>
        </div>
      </div>

      {newTaxRate > 30 && (
        <div className="flex items-center gap-1.5 text-[10px] text-military bg-military/10 p-2 rounded-xl border border-military/30 font-sans">
          <ShieldAlert size={13} className="shrink-0" />
          <span>
            مالیات بالای ۳۰٪ به دلیل کاهش شدید و مداوم ثبات نوبتی، کشور را در
            مسیر بحران سیاسی قرار می‌دهد!
          </span>
        </div>
      )}
    </div>
  );
}

interface TaxControlCardProps {
  taxRate: number;
  baseGdp: number;
  corruption?: number;
  nationId: string;
}

export function TaxControlCard({
  taxRate: initialTaxRate,
  baseGdp,
  corruption = 0,
  nationId,
}: TaxControlCardProps) {
  const [taxRate, setTaxRate] = useState<number>(Math.min(50, initialTaxRate));
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const handleApplyTax = async () => {
    const action = ActionFactory.setTaxRate(nationId, taxRate);
    await dispatchAction(
      action,
      `نرخ مالیات جدید روی ${PersianNumberFormatter.toPersianDigits(taxRate)}٪ تنظیم شد.`,
    );
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxRate(Number(e.target.value));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={13} className="text-diplomacy" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تنظیمات مالیاتی و قانون
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-extrabold text-foreground text-sm">
            {PersianNumberFormatter.toPersianDigits(taxRate)}٪
          </span>
          <span className="text-muted-foreground">نرخ مالیات جدید</span>
        </div>

        <TaxSlider
          taxRate={taxRate}
          isDragging={isDragging}
          onChange={handleSliderChange}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />

        <PredictiveImpactBox
          newTaxRate={taxRate}
          baseGdp={baseGdp}
          corruption={corruption}
        />

        <button
          onClick={handleApplyTax}
          className="w-full py-2.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          اعمال نرخ جدید مالیات (
          {PersianNumberFormatter.toPersianDigits(taxRate)}٪)
        </button>
      </div>
    </div>
  );
}
