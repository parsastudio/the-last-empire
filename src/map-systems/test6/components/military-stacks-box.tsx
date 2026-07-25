import React from "react";
import { MilitaryStack } from "@/domain/military/military.schema";

interface MilitaryStacksBoxProps {
  military: MilitaryStack;
}

export function MilitaryStacksBox({ military }: MilitaryStacksBoxProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Military Stacks
      </h3>
      <div className="grid grid-cols-3 gap-2 font-mono">
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
          <div className="text-[10px] text-slate-500">INF</div>
          <div className="text-sm font-bold text-white mt-1">
            {military.infantry}
          </div>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
          <div className="text-[10px] text-slate-500">AIR</div>
          <div className="text-sm font-bold text-white mt-1">
            {military.airForce}
          </div>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
          <div className="text-[10px] text-slate-500">DRN</div>
          <div className="text-sm font-bold text-white mt-1">
            {military.droneMissile}
          </div>
        </div>
      </div>
    </div>
  );
}
