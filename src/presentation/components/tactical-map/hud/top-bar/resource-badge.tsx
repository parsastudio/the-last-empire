import React from "react";
import { LucideIcon } from "lucide-react";

interface ResourceBadgeProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string | number;
  subValue?: string;
  subValueColor?: string;
}

export function ResourceBadge({
  icon: Icon,
  iconColor,
  label,
  value,
  subValue,
  subValueColor = "text-gdp",
}: ResourceBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 bg-secondary/40 border border-border/60 px-3 py-1.5 rounded-2xl font-mono text-xs transition-colors hover:bg-secondary/60 cursor-default shrink-0"
      title={label}
    >
      <Icon size={14} className={`${iconColor} shrink-0`} />
      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-bold text-foreground">{value}</span>
        {subValue && (
          <span className={`text-[10px] font-semibold ${subValueColor}`}>
            ({subValue})
          </span>
        )}
      </div>
    </div>
  );
}
