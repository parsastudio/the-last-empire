import React from "react";
import { AbilityItem } from "./abilities.config";

interface AbilityCardProps {
  ability: AbilityItem;
  currentGovernment: string;
  onActivate: (ability: AbilityItem) => void;
}

export function AbilityCard({
  ability,
  currentGovernment,
  onActivate,
}: AbilityCardProps) {
  const Icon = ability.icon;
  const isCompatible = ability.requiredGov === currentGovernment;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all space-y-3 text-right dir-rtl ${
        isCompatible
          ? "bg-background/60 border-primary/40 shadow-sm"
          : "bg-background/20 border-border/40 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={ability.color} />
          <span className="text-xs font-bold text-foreground">
            {ability.name}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
            isCompatible
              ? "bg-gdp/20 text-gdp font-bold"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          مختص: {ability.govLabel}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {ability.desc}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <span className="text-[9px] font-mono text-muted-foreground">
          {ability.cooldown}
        </span>
        <button
          onClick={() => onActivate(ability)}
          disabled={!isCompatible}
          className={`py-2 px-4 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
            isCompatible
              ? "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isCompatible ? "فعال‌سازی توانمندی" : "نیازمند تغییر رژیم"}
        </button>
      </div>
    </div>
  );
}
