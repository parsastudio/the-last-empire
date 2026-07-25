import React from "react";

interface ResetSessionButtonProps {
  onReset: () => void;
}

export function ResetSessionButton({ onReset }: ResetSessionButtonProps) {
  return (
    <button
      onClick={onReset}
      className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold hover:bg-slate-800 hover:text-rose-400 transition-colors"
    >
      RESET SOVEREIGN SESSION
    </button>
  );
}
