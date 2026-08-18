import React from "react";

interface TaxSliderProps {
  taxRate: number;
  isDragging: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function TaxSlider({
  taxRate,
  isDragging,
  onChange,
  onDragStart,
  onDragEnd,
}: TaxSliderProps) {
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
