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
    <div className="absolute top-20 left-20 p-5 bg-slate-950/90 border border-slate-900 rounded-3xl shadow-2xl z-40 max-w-xs pointer-events-auto font-mono text-[11px] space-y-3 backdrop-blur-md min-w-[280px] animate-in fade-in zoom-in-95 duration-150">
      <div>
        <span className="text-slate-500 text-[9px] uppercase tracking-wider block">
          Invasion Objective
        </span>
        <span className="text-xs font-bold text-white block mt-0.5">
          {hoveredCountry.name} ({hoveredCountry.code})
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3.5 border-t border-slate-900 pt-3">
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">
            Vectors
          </span>
          <span className="text-white font-semibold block mt-0.5">
            {targetCell.x}, {targetCell.y}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">
            Area
          </span>
          <span className="text-emerald-400 font-semibold block mt-0.5">
            {formatArea(hoveredCountry.areaSqKm || 0)} km²
          </span>
        </div>
      </div>
      {playerNationId && hoveredCountry.code !== playerNationId && (
        <button
          onClick={onAttack}
          disabled={isAttacking}
          className="w-full py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-xl font-bold transition-colors border border-rose-500/20 uppercase tracking-wider text-[9px] mt-2 block"
        >
          {isAttacking ? "Launching..." : "Deploy Campaign Strike"}
        </button>
      )}
    </div>
  );
}
