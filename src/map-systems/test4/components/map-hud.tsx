import React from "react";
import type {
  CountryPhase1,
  IslandPhase2,
  RegionPhase3,
} from "../engine/types";

interface MapHudProps {
  phase: 1 | 2 | 3;
  activeHoveredCountryDetails: CountryPhase1 | null;
  activeHoveredIslandDetails: IslandPhase2 | null;
  activeHoveredRegionDetails:
    | (RegionPhase3 & { countryTotalArea: number })
    | null;
}

export const MapHud: React.FC<MapHudProps> = ({
  phase,
  activeHoveredCountryDetails,
  activeHoveredIslandDetails,
  activeHoveredRegionDetails,
}) => {
  return (
    <>
      {phase === 1 && activeHoveredCountryDetails && (
        <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1 backdrop-blur-sm">
          <div className="text-slate-400">Selected Country</div>
          <div className="text-sm font-bold text-white">
            {activeHoveredCountryDetails.name} (
            {activeHoveredCountryDetails.code})
          </div>
          <hr className="border-slate-800" />
          <div>
            <span className="text-slate-500">Total Land Area:</span>{" "}
            {activeHoveredCountryDetails.area.toFixed(6)} sq. deg
          </div>
        </div>
      )}

      {phase === 2 && activeHoveredIslandDetails && (
        <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
          <div className="text-slate-400">Isolated Geopolitical Sector</div>
          <div className="text-sm font-bold text-white">
            {activeHoveredIslandDetails.id}
          </div>
          <hr className="border-slate-800" />
          <div>
            <span className="text-slate-500">Country:</span>{" "}
            {activeHoveredIslandDetails.countryName} (
            {activeHoveredIslandDetails.countryCode})
          </div>
          <div>
            <span className="text-slate-500">Calculated Area:</span>{" "}
            {activeHoveredIslandDetails.area.toFixed(6)} sq. deg
          </div>
          <div>
            <span className="text-slate-500">Projected Center:</span>{" "}
            {activeHoveredIslandDetails.center[0].toFixed(2)},{" "}
            {activeHoveredIslandDetails.center[1].toFixed(2)}
          </div>
        </div>
      )}

      {phase === 3 && activeHoveredRegionDetails && (
        <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-md pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
          <div className="text-slate-400">Active Map Sector</div>
          <div className="text-sm font-bold text-white">
            {activeHoveredRegionDetails.id}
          </div>
          <hr className="border-slate-800" />
          <div>
            <span className="text-slate-500">Country:</span>{" "}
            {activeHoveredRegionDetails.countryName} (
            {activeHoveredRegionDetails.countryCode})
          </div>
          <div>
            <span className="text-slate-500">Sector Area:</span>{" "}
            {activeHoveredRegionDetails.area.toFixed(6)} sq. deg
          </div>
          <div>
            <span className="text-slate-500">Country Total Area:</span>{" "}
            {activeHoveredRegionDetails.countryTotalArea.toFixed(6)} sq. deg
          </div>
          <div>
            <span className="text-slate-500">Projected Centroid:</span>{" "}
            {activeHoveredRegionDetails.center[0].toFixed(2)},{" "}
            {activeHoveredRegionDetails.center[1].toFixed(2)}
          </div>
          <div>
            <span className="text-slate-500">Adjacent Sectors:</span>
            <div className="max-h-20 overflow-y-auto mt-1 flex flex-wrap gap-1">
              {activeHoveredRegionDetails.neighbors.length === 0 ? (
                <span className="text-slate-600 italic">
                  None (Isolated Island)
                </span>
              ) : (
                activeHoveredRegionDetails.neighbors.map((n) => (
                  <span
                    key={n}
                    className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] text-slate-300"
                  >
                    {n}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
