import React from "react";
import { LucideIcon } from "lucide-react";

interface CasualtyRowProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  attackerValue: string;
  defenderValue: string;
  attackerColor?: string;
  defenderColor?: string;
}

export function CasualtyRow({
  icon: Icon,
  iconColor,
  label,
  attackerValue,
  defenderValue,
  attackerColor = "text-foreground",
  defenderColor = "text-foreground",
}: CasualtyRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2 items-center text-center py-1 border-b border-border/40 dir-rtl">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start font-sans">
        <Icon size={13} className={iconColor} />
        <span>{label}</span>
      </div>
      <span className={`font-bold ${attackerColor}`}>{attackerValue}</span>
      <span className={`font-bold ${defenderColor}`}>{defenderValue}</span>
    </div>
  );
}
