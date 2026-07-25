import React from "react";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
}

interface MapHoverCardProps {
  hoveredCountry: CountryMapping;
}

export function MapHoverCard({ hoveredCountry }: MapHoverCardProps) {
  return (
    <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
      <div className="text-slate-400">Tactical Scan Identification</div>
      <div className="text-sm font-bold text-white">
        {hoveredCountry.name} ({hoveredCountry.code})
      </div>
      <hr className="border-slate-800" />
      <div>
        <span className="text-slate-500">Indexed Map ID:</span>{" "}
        {hoveredCountry.id}
      </div>
    </div>
  );
}
