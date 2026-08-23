import React, { useRef, useCallback } from "react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface TaxSliderProps {
  currentRate: number;
  tiers: number[];
  onSelectRate: (rate: number) => void;
}

export function TaxSlider({
  currentRate,
  tiers,
  onSelectRate,
}: TaxSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = Math.max(
    0,
    tiers.reduce((bestIdx, rate, idx) => {
      return Math.abs(rate - currentRate) <
        Math.abs(tiers[bestIdx]! - currentRate)
        ? idx
        : bestIdx;
    }, 0),
  );

  const maxIndex = Math.max(1, tiers.length - 1);
  const fillPercentage = (currentIndex / maxIndex) * 100;

  const updateFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const clickX = rect.right - clientX;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetIdx = Math.round(ratio * maxIndex);
      const selectedTier = tiers[targetIdx];
      if (selectedTier !== undefined) {
        onSelectRate(selectedTier);
      }
    },
    [maxIndex, tiers, onSelectRate],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    updateFromPointer(e.clientX);
  };

  return (
    <div className="space-y-2 font-sans dir-rtl select-none pt-1">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative w-full h-7 flex items-center cursor-pointer group touch-none"
      >
        <div className="w-full h-1.5 bg-secondary rounded-full relative overflow-visible">
          <div
            className="absolute top-0 right-0 h-full bg-gdp rounded-full transition-all duration-150"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <div className="absolute inset-x-0 inset-y-0 pointer-events-none">
          {tiers.map((tier, idx) => {
            const isSelected = idx === currentIndex;
            const isPassed = idx <= currentIndex;
            const positionPct = (idx / maxIndex) * 100;

            return (
              <div
                key={tier}
                className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center"
                style={{ right: `${positionPct}%` }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                    isSelected
                      ? "bg-gdp border-card shadow-md shadow-gdp/50 scale-125 ring-2 ring-gdp/30"
                      : isPassed
                        ? "bg-gdp/80 border-card scale-90"
                        : "bg-card border-border/80 scale-75"
                  }`}
                >
                  {isSelected && (
                    <div className="w-1 h-1 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative flex justify-between items-center text-[10px] font-mono text-muted-foreground px-0.5">
        {tiers.map((tier, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onSelectRate(tier)}
              className={`transition-all cursor-pointer ${
                isSelected
                  ? "text-gdp font-black text-xs scale-110"
                  : "hover:text-foreground"
              }`}
            >
              {PersianNumberFormatter.toPersianDigits(tier)}٪
            </button>
          );
        })}
      </div>
    </div>
  );
}
