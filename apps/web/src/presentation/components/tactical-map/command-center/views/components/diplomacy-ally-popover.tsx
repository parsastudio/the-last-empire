import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  Award,
  Coins,
  ShieldCheck,
  ArrowRight,
  Swords,
  AlertTriangle,
} from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { NationAllyDetail } from "./diplomacy-allies-resolver.utility";

interface DiplomacyAllyPopoverProps {
  ally: NationAllyDetail;
  onClose: () => void;
  onSelectCountry: (code: string) => void;
}

export function DiplomacyAllyPopover({
  ally,
  onClose,
  onSelectCountry,
}: DiplomacyAllyPopoverProps) {
  const t = useTranslations("diplomacy.allyPopover");
  const { toDigits, formatLevel } = useLocaleFormatter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="p-3.5 rounded-2xl bg-secondary/95 border-2 border-rose-500/50 shadow-2xl backdrop-blur-2xl space-y-3 animate-fade-smooth relative text-start font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="text-2xl select-none shrink-0">
            {ally.flagEmoji}
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-foreground">
                {ally.name}
              </h4>
              <span className="text-[9px] font-mono font-bold bg-background/80 px-1.5 py-0.2 rounded border border-border/50 text-muted-foreground">
                {ally.code}
              </span>
            </div>
            <span className="text-[10px] font-bold text-rose-400 font-sans flex items-center gap-1">
              <Swords size={11} />
              <span>{t("warInterventionSubtitle")}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-2 text-[11px] text-foreground/90 leading-relaxed">
        <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
        <p>{t("warningAlert", { name: ally.name })}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Award size={11} className="text-amber-400 shrink-0" />
            {t("worldRank")}
          </span>
          <span className="font-extrabold text-foreground block">
            #{toDigits(ally.rank)}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Coins size={11} className="text-gdp shrink-0" />
            {t("gdp")}
          </span>
          <span className="font-extrabold text-gdp block truncate">
            {ally.gdpFormatted}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <ShieldCheck size={11} className="text-primary shrink-0" />
            {t("milTech")}
          </span>
          <span className="font-extrabold text-primary block">
            {formatLevel(ally.militaryTech)}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Swords size={11} className="text-rose-400 shrink-0" />
            {t("combatStatus")}
          </span>
          <span className="font-extrabold text-rose-400 block truncate font-sans text-[9px]">
            {t("retaliatoryWar")}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onSelectCountry(ally.code);
          onClose();
        }}
        className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>{t("inspectAction", { name: ally.name })}</span>
        <ArrowRight size={12} className="rtl:rotate-180 shrink-0" />
      </button>
    </div>
  );
}
