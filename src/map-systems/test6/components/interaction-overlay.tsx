import React from "react";
import { Coordinate } from "@/domain/map/coordinate.schema";

interface InteractionOverlayProps {
  targetCell: Coordinate;
  targetCountryName: string;
  targetCountryId: string;
  onAttack: () => void;
  isAttacking: boolean;
}

export function InteractionOverlay({
  targetCell,
  targetCountryName,
  targetCountryId,
  onAttack,
  isAttacking,
}: InteractionOverlayProps) {
  return (
    <div className="absolute top-20 left-4 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 w-64 pointer-events-auto font-mono text-xs space-y-3 backdrop-blur-sm">
      <div className="space-y-0.5">
        <div className="text-slate-500">Invasion Target Vector</div>
        <div className="text-sm font-bold text-rose-400">
          {targetCountryName}
        </div>
      </div>
      <div className="space-y-1 text-[11px] text-slate-400">
        <div className="flex justify-between">
          <span>Coordinates:</span>
          <span className="text-white">
            x: {targetCell.x}, y: {targetCell.y}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Sovereign ID:</span>
          <span className="text-white">{targetCountryId}</span>
        </div>
      </div>
      <button
        onClick={onAttack}
        disabled={isAttacking}
        className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-lg font-bold transition-colors border border-rose-500/30 uppercase tracking-wider text-[10px]"
      >
        {isAttacking ? "Launching Strike..." : "Infiltrate & Conquer"}
      </button>
    </div>
  );
}
