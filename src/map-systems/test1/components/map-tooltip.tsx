import React from "react";

interface MapTooltipProps {
  hoveredCountry: string;
  playerCountryCode: string | null;
  occupations: Record<string, number>;
  getCountryFullName: (code: string) => string;
}

export function MapTooltip({
  hoveredCountry,
  playerCountryCode,
  occupations,
  getCountryFullName,
}: MapTooltipProps) {
  return (
    <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800/80 text-xs font-semibold shadow-2xl pointer-events-none z-40">
      <div className="text-slate-400">Target Country</div>
      <div className="text-lg font-bold text-white mt-0.5">
        {getCountryFullName(hoveredCountry)}
      </div>
      {playerCountryCode &&
        hoveredCountry !== playerCountryCode &&
        (occupations[hoveredCountry] || 0) > 0 && (
          <div className="text-[10px] text-emerald-400 mt-1 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {occupations[hoveredCountry]}% occupied by {playerCountryCode}
          </div>
        )}
    </div>
  );
}
