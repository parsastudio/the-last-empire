import React from "react";
import { Coins } from "lucide-react";

interface TributeStatusBadgeProps {
  tributePerTurn: number;
}

export function TributeStatusBadge({
  tributePerTurn,
}: TributeStatusBadgeProps) {
  if (tributePerTurn <= 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono">
      <span className="text-[10px] text-amber-500 flex items-center gap-1 font-sans">
        <Coins size={12} />
        باج سالانه جاری:
      </span>
      <span className="font-bold text-amber-500">
        ${tributePerTurn.toLocaleString("fa-IR")} / نوبت
      </span>
    </div>
  );
}
