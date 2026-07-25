import React from "react";
import { UnitType } from "@/domain/military/military.schema";

interface RecruitmentCenterProps {
  onRecruit: (type: UnitType, quantity: number) => void;
  infantryCost: number;
  airForceCost: number;
}

export function RecruitmentCenter({
  onRecruit,
  infantryCost,
  airForceCost,
}: RecruitmentCenterProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        War Recruitment Mobilization
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onRecruit("INFANTRY", 10)}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left space-y-1 transition-colors"
        >
          <div className="text-[10px] font-mono text-slate-500">
            10x Infantry
          </div>
          <div className="text-xs font-bold text-emerald-400 font-mono">
            ${infantryCost}
          </div>
        </button>
        <button
          onClick={() => onRecruit("AIR_FORCE", 2)}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-left space-y-1 transition-colors"
        >
          <div className="text-[10px] font-mono text-slate-500">
            2x Air Force
          </div>
          <div className="text-xs font-bold text-emerald-400 font-mono">
            ${airForceCost}
          </div>
        </button>
      </div>
    </div>
  );
}
