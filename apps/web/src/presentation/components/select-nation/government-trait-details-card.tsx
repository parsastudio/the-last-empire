import React from "react";
import { useTranslations } from "next-intl";
import { LucideIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { GovernmentType } from "@geopolitics/domain";

interface GovernmentTraitDetailsCardProps {
  type: GovernmentType;
  icon: LucideIcon;
}

export function GovernmentTraitDetailsCard({
  type,
  icon: Icon,
}: GovernmentTraitDetailsCardProps) {
  const t = useTranslations("governments");

  const name = t(`${type}.name`);
  const pros = t.raw(`${type}.pros`) as string[];
  const cons = t.raw(`${type}.cons`) as string[];

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-card/95 border border-primary/40 shadow-xl backdrop-blur-2xl space-y-3.5 animate-fade-smooth text-start font-sans relative overflow-hidden ring-1 ring-white/5">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0 shadow-inner">
          <Icon size={18} />
        </div>
        <h3 className="text-xs sm:text-sm font-black text-foreground">
          {t("doctrinesAndEffects", { name })}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="space-y-2 bg-gdp/5 border border-gdp/25 p-3 rounded-2xl">
          <div className="space-y-1.5">
            {pros.map((pro, idx) => (
              <div
                key={idx}
                className="bg-card/90 border border-gdp/30 p-2.5 rounded-xl flex items-start gap-2 text-[11px] sm:text-xs text-foreground font-medium shadow-sm"
              >
                <CheckCircle2 size={14} className="text-gdp shrink-0 mt-0.5" />
                <span className="leading-relaxed">{pro}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 bg-rose-500/5 border border-rose-500/25 p-3 rounded-2xl">
          <div className="space-y-1.5">
            {cons.map((con, idx) => (
              <div
                key={idx}
                className="bg-card/90 border border-rose-500/30 p-2.5 rounded-xl flex items-start gap-2 text-[11px] sm:text-xs text-foreground font-medium shadow-sm"
              >
                <AlertTriangle
                  size={14}
                  className="text-rose-400 shrink-0 mt-0.5"
                />
                <span className="leading-relaxed">{con}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
