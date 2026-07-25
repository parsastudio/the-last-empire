import React from "react";
import { MilitaryStack, UnitType } from "@/domain/military/military.schema";

interface MilitaryRecruitmentPanelProps {
  military: MilitaryStack;
  onRecruit: (type: UnitType, quantity: number) => void;
}

export function MilitaryRecruitmentPanel({
  military,
  onRecruit,
}: MilitaryRecruitmentPanelProps) {
  return (
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-950 space-y-3.5">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
        Active Deployment Forces
      </h3>
      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        <div className="bg-slate-900/20 p-2.5 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-650 block">INF</span>
          <span className="text-xs font-bold text-white block mt-0.5">
            {military.infantry}
          </span>
        </div>
        <div className="bg-slate-900/20 p-2.5 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-650 block">AIR</span>
          <span className="text-xs font-bold text-white block mt-0.5">
            {military.airForce}
          </span>
        </div>
        <div className="bg-slate-900/20 p-2.5 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-650 block">DRN</span>
          <span className="text-xs font-bold text-white block mt-0.5">
            {military.droneMissile}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onRecruit("INFANTRY", 10)}
          className="py-2.5 px-3 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 rounded-xl text-left text-[10px] transition-all font-mono"
        >
          <span className="text-slate-550 block">10x Infantry</span>
          <span className="text-emerald-450 font-bold block mt-0.5">
            $1,000
          </span>
        </button>
        <button
          onClick={() => onRecruit("AIR_FORCE", 2)}
          className="py-2.5 px-3 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 rounded-xl text-left text-[10px] transition-all font-mono"
        >
          <span className="text-slate-550 block">2x Air Force</span>
          <span className="text-emerald-455 font-bold block mt-0.5">
            $1,000
          </span>
        </button>
      </div>
    </div>
  );
}
