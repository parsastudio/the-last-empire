import React from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { ActiveModifier } from "@/domain/nation/nation.schema";

interface ActiveModifiersCardProps {
  modifiers?: ActiveModifier[];
}

export function ActiveModifiersCard({
  modifiers = [],
}: ActiveModifiersCardProps) {
  const t = useTranslations("overview.modifiers");

  if (!modifiers || modifiers.length === 0) return null;

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <ShieldAlert size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          {t("title")}
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {modifiers.map((mod) => (
          <div
            key={mod.id}
            className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between"
          >
            <div className="space-y-0.5 text-right">
              <span className="text-xs font-bold text-foreground block font-sans">
                {mod.name}
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                {mod.effectType}:{" "}
                {mod.magnitude > 0 ? `+${mod.magnitude}` : mod.magnitude}
              </span>
            </div>
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground">
              {t("turnsRemaining", { count: mod.turnsRemaining })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
