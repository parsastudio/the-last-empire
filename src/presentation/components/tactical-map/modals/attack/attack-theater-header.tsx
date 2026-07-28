import React from "react";
import { ArrowLeft } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface AttackTheaterHeaderProps {
  attackerName: string;
  attackerCode: string;
  targetName: string;
  targetCode: string;
}

export function AttackTheaterHeader({
  attackerName,
  attackerCode,
  targetName,
  targetCode,
}: AttackTheaterHeaderProps) {
  const attackerFlag = getFlagEmoji(attackerCode);
  const targetFlag = getFlagEmoji(targetCode);

  return (
    <div className="bg-secondary/40 border border-border/80 p-4 rounded-2xl flex items-center justify-between font-sans">
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="text-2xl">{attackerFlag}</span>
        <span>{attackerName}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <ArrowLeft size={18} className="text-military animate-pulse" />
        <span className="text-[9px] font-mono text-muted-foreground">
          تئاتر عملیاتی
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold">
        <span>{targetName}</span>
        <span className="text-2xl">{targetFlag}</span>
      </div>
    </div>
  );
}
