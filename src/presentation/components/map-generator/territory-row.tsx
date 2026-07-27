import React from "react";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  areaSqKm: number;
}

interface TerritoryRowProps {
  country: CountryMapping;
}

export function TerritoryRow({ country }: TerritoryRowProps) {
  return (
    <div className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
      <div className="flex items-center gap-4">
        <span className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full flex items-center justify-center">
          <span className="w-1 h-1 bg-emerald-500 rounded-full" />
        </span>
        <div>
          <div className="text-xs font-bold text-slate-200">{country.name}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            ISO_A3: {country.code}
          </div>
        </div>
      </div>
      <div className="text-right font-mono text-xs">
        <div className="text-slate-300 font-semibold">
          {country.id === 0
            ? "Infinite"
            : `${new Intl.NumberFormat("en-US").format(country.areaSqKm)} km²`}
        </div>
        <div className="text-[9px] text-slate-500 mt-0.5">
          INDEX ID: {country.id}
        </div>
      </div>
    </div>
  );
}
