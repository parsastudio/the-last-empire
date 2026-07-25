import React from "react";
import { Coordinate } from "@/domain/map/coordinate.schema";

interface HoveredCountryProps {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

interface HoverTargetOverlayProps {
  targetCell: Coordinate;
  hoveredCountry: HoveredCountryProps | null;
  onAttack: () => void;
  isAttacking: boolean;
  playerNationId: string | null;
}

export function HoverTargetOverlay({
  targetCell,
  hoveredCountry,
  onAttack,
  isAttacking,
  playerNationId,
}: HoverTargetOverlayProps) {
  if (!hoveredCountry) {
    return null;
  }

  const formatArea = (area: number): string => {
    return new Intl.NumberFormat("en-US").format(area);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-5 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl z-40 max-w-sm pointer-events-auto font-mono text-xs space-y-3.5 backdrop-blur-md min-w-[340px]">
      <div>
        <div className="text-slate-500 text-[10px] uppercase tracking-wider">
          Tactical Target Scan
        </div>
        <div className="text-sm font-bold text-white mt-0.5">
          {hoveredCountry.name} ({hoveredCountry.code})
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400">
        <div>
          <span className="text-slate-500 block">Coordinates</span>
          <span className="text-white font-bold block mt-0.5">
            X: {targetCell.x}, Y: {targetCell.y}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Territory Size</span>
          <span className="text-emerald-400 font-bold block mt-0.5">
            {formatArea(hoveredCountry.areaSqKm || 0)} km²
          </span>
        </div>
      </div>
      {playerNationId && hoveredCountry.code !== playerNationId && (
        <button
          onClick={onAttack}
          disabled={isAttacking}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-xl font-bold transition-colors border border-rose-500/30 uppercase tracking-wider text-[10px]"
        >
          {isAttacking ? "Launching Campaign..." : "Initiate Direct Strike"}
        </button>
      )}
    </div>
  );
}
