import React from "react";
import { SubdividedRegion } from "@/engine/world-divider/world-divider";

interface RegionTooltipProps {
  region: SubdividedRegion;
}

export function RegionTooltip({ region }: RegionTooltipProps) {
  return (
    <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
      <div className="text-slate-400">Sector ID</div>
      <div className="text-sm font-bold text-white">{region.id}</div>
      <hr className="border-slate-800" />
      <div>
        <span className="text-slate-500">Country:</span> {region.countryName} (
        {region.countryCode})
      </div>
      <div>
        <span className="text-slate-500">Direct Ocean Access:</span>{" "}
        <span
          className={region.isCoastal ? "text-emerald-400" : "text-rose-500"}
        >
          {region.isCoastal ? "YES" : "NO"}
        </span>
      </div>
      <div>
        <span className="text-slate-500">Neighbors:</span>{" "}
        <div className="max-h-24 overflow-y-auto mt-1 flex flex-wrap gap-1">
          {region.neighbors.length === 0 ? (
            <span className="text-slate-600 italic">None</span>
          ) : (
            region.neighbors.map((n) => (
              <span
                key={n}
                className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px]"
              >
                {n}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
