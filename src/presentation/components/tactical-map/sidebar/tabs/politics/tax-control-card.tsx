import React, { useState, useRef } from "react";
import { Landmark } from "lucide-react";

interface TaxControlCardProps {
  taxRate: number;
}

export function TaxControlCard({
  taxRate: initialTaxRate,
}: TaxControlCardProps) {
  const [taxRate, setTaxRate] = useState<number>(initialTaxRate);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleApplyTax = () => {
    alert(
      `نرخ مالیات جدید با موفقیت روی ${taxRate}% تنظیم شد و در چرخه اقتصادی نوبت بعدی اعمال خواهد شد.`,
    );
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setTaxRate(newValue);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={13} className="text-diplomacy" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تنظیمات مالیاتی و قانون
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-extrabold text-foreground text-sm">
            {taxRate}%
          </span>
          <span className="text-muted-foreground">نرخ مالیات فعلی</span>
        </div>

        <div className="space-y-2">
          <div dir="rtl" className="relative w-full flex items-center h-6">
            <div className="absolute w-full h-2 bg-secondary rounded-lg overflow-hidden">
              <div
                className="absolute top-0 h-full bg-gdp transition-all duration-75 right-0"
                style={{
                  width: `${taxRate}%`,
                  transition: isDragging ? "none" : "width 0.1s ease-out",
                }}
              />
            </div>

            <input
              ref={inputRef}
              type="range"
              min="0"
              max="100"
              value={taxRate}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-transparent rounded-lg appearance-none relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gdp [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gdp [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-card [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-0.5">
            <span>0% (آزاد)</span>
            <span>50% (متعادل)</span>
            <span>100% (حداکثری)</span>
          </div>
        </div>

        <button
          onClick={handleApplyTax}
          className="w-full py-2.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          اعمال نرخ جدید مالیات ({taxRate}%)
        </button>
      </div>
    </div>
  );
}
