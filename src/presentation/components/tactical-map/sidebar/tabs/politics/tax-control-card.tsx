import React, { useState, useRef } from "react";
import { Landmark } from "lucide-react";
import { TaxSlider } from "./tax-slider";

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

        <TaxSlider
          taxRate={taxRate}
          isDragging={isDragging}
          inputRef={inputRef}
          onChange={handleSliderChange}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />

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
