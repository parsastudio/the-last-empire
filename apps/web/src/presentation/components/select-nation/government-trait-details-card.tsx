import React from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  ShieldAlert,
  LucideIcon,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { GovernmentType } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface GovernmentTraitDetailsCardProps {
  type: GovernmentType;
  icon: LucideIcon;
}

export function GovernmentTraitDetailsCard({
  type,
  icon: Icon,
}: GovernmentTraitDetailsCardProps) {
  const t = useTranslations("governments");
  const { toDigits } = useLocaleFormatter();

  const name = t(`${type}.name`);
  const headline = t(`${type}.headline`);
  const description = t(`${type}.description`);
  const pros = t.raw(`${type}.pros`) as string[];
  const cons = t.raw(`${type}.cons`) as string[];

  return (
    <div className="p-5 rounded-3xl bg-card/95 border border-primary/40 shadow-xl backdrop-blur-2xl space-y-4 animate-fade-smooth text-start font-sans relative overflow-hidden ring-1 ring-white/5">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="flex items-center gap-3 pb-3 border-b border-border/60">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0 shadow-inner">
          <Icon size={20} />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-foreground">
            {t("doctrinesAndEffects", { name })}
          </h3>
          <p className="text-[11px] text-muted-foreground">{headline}</p>
        </div>
      </div>

      <p className="text-xs text-foreground/90 leading-relaxed font-sans bg-background/60 border border-border/70 p-3.5 rounded-2xl shadow-inner">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2 bg-gdp/5 border border-gdp/25 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-black text-gdp">
            <Sparkles size={14} />
            <span>
              {t("prosTitle", {
                count: toDigits(pros.length),
              })}
            </span>
          </div>
          <div className="space-y-1.5 pt-0.5">
            {pros.map((pro, idx) => (
              <div
                key={idx}
                className="bg-card/90 border border-gdp/30 p-2.5 rounded-xl flex items-start gap-2 text-xs text-foreground font-medium shadow-sm"
              >
                <CheckCircle2 size={15} className="text-gdp shrink-0 mt-0.5" />
                <span className="leading-relaxed">{pro}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 bg-rose-500/5 border border-rose-500/25 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-black text-rose-400">
            <ShieldAlert size={14} />
            <span>
              {t("consTitle", {
                count: toDigits(cons.length),
              })}
            </span>
          </div>
          <div className="space-y-1.5 pt-0.5">
            {cons.map((con, idx) => (
              <div
                key={idx}
                className="bg-card/90 border border-rose-500/30 p-2.5 rounded-xl flex items-start gap-2 text-xs text-foreground font-medium shadow-sm"
              >
                <AlertTriangle
                  size={15}
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
