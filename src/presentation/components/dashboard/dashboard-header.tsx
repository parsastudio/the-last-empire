import React from "react";

interface DashboardHeaderProps {
  onReset: () => void;
}

export function DashboardHeader({ onReset }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
      <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">
        Strategic Dashboard
      </h1>
      <button
        onClick={onReset}
        className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors border border-rose-500/30"
      >
        Reset Map
      </button>
    </div>
  );
}
