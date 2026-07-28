import React, { useState, useRef } from "react";
import { Landmark } from "lucide-react";
import { TaxSlider } from "./tax-slider";
import { PredictiveImpactBox } from "./predictive-impact-box";
import { useToast } from "@/presentation/context/toast-context";

interface TaxControlCardProps {
  taxRate: number;
}

export function TaxControlCard({
  taxRate: initialTaxRate,
}: TaxControlCardProps) {
  const [taxRate, setTaxRate] = useState<number>(initialTaxRate);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleApplyTax = () => {
    showToast(
      "بروزرسانی نرخ مالیات",
      `نرخ مالیات جدید روی ${taxRate}% تنظیم شد و در چرخه بعدی اعمال می‌شود.`,
      "success",
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
            {taxRate}%
          </span>
          <span className="text-muted-foreground">نرخ مالیات جدید</span>
        </div>

        <TaxSlider
          taxRate={taxRate}
          isDragging={isDragging}
          inputRef={inputRef}
          onChange={handleSliderChange}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />

        <PredictiveImpactBox
          currentTaxRate={initialTaxRate}
          newTaxRate={taxRate}
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
