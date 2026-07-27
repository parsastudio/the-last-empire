import React from "react";

interface NationHeaderCardProps {
  name: string;
  code: string;
  flagCode: string;
  governmentType: string;
  population: number;
}

export function NationHeaderCard({
  name,
  code,
  flagCode,
  governmentType,
  population,
}: NationHeaderCardProps) {
  return (
    <div className="bg-background/60 border border-border/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-inner">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/flags/${flagCode.toLowerCase()}.png`}
        alt={name}
        className="w-12 h-9 object-cover rounded-xl shadow-sm border border-border shrink-0"
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
      />
      <div className="space-y-0.5 overflow-hidden text-right">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-foreground truncate">
            {name}
          </span>
          <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            {code}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">
          نظام: {governmentType} | جمعیت: {(population / 1e6).toFixed(1)}م
        </p>
      </div>
    </div>
  );
}
