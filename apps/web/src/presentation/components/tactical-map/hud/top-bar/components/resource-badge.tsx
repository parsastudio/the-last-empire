import React from "react";

interface ResourceBadgeProps {
  icon: React.ElementType;
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
      className="flex items-center gap-2 bg-secondary/60 hover:bg-secondary/90 border border-border/80 hover:border-gdp/40 px-3.5 py-1.5 rounded-2xl font-mono text-xs transition-all cursor-default shrink-0 shadow-sm relative overflow-hidden backdrop-blur-md group"
      title={label}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-gdp/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <Icon
        size={14}
        className={`${iconColor} shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]`}
      />
      <div className="flex items-center gap-1.5 leading-none relative z-10">
        <span className="font-extrabold text-foreground">{value}</span>
        {subValue && (
          <span className={`text-[10px] font-bold ${subValueColor}`}>
            ({subValue})
          </span>
        )}
      </div>
    </div>
  );
}
