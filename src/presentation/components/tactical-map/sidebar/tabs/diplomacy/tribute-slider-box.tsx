import React from "react";
import { Coins } from "lucide-react";

interface TributeSliderBoxProps {
  amount: number;
  maxAmount: number;
  onChangeAmount: (value: number) => void;
}

export function TributeSliderBox({
  amount,
  maxAmount,
  onChangeAmount,
}: TributeSliderBoxProps) {
  return (
    <div className="space-y-3 font-mono text-xs dir-rtl">
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground font-sans">
            مبلغ باج نوبتی:
          </span>
          <span className="font-bold text-gdp flex items-center gap-1">
            <Coins size={12} />${amount.toLocaleString("fa-IR")}
          </span>
        </div>

        <input
          type="range"
          min="1000"
          max={Math.max(1000, maxAmount)}
          step="1000"
          value={amount}
          onChange={(e) => onChangeAmount(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <div className="flex justify-between text-[9px] text-muted-foreground font-sans">
          <span>کف: $۱,۰۰۰</span>
          <span>
            سقف قانونی (۱۰٪ خزانه): ${maxAmount.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>
    </div>
  );
}
