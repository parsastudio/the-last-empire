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
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Recruitment & Forces
      </h3>
      <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-500 block">INF</span>
          <span className="text-xs font-bold text-white block mt-0.5">
            {military.infantry}
          </span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-500 block">AIR</span>
          <span className="text-xs font-bold text-white block mt-0.5">
            {military.airForce}
          </span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-500 block">DRN</span>
          <span className="text-xs font-bold text-white block mt-0.5">
            {military.droneMissile}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => onRecruit("INFANTRY", 10)}
          className="py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left text-[10px] transition-all font-mono"
        >
          <span className="text-slate-500 block">10x Infantry</span>
          <span className="text-emerald-400 font-bold block">$1,000</span>
        </button>
        <button
          onClick={() => onRecruit("AIR_FORCE", 2)}
          className="py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left text-[10px] transition-all font-mono"
        >
          <span className="text-slate-500 block">2x Air Force</span>
          <span className="text-emerald-400 font-bold block">$1,000</span>
        </button>
      </div>
    </div>
  );
}
