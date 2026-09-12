import React from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Shield,
  ShieldAlert,
  Crosshair,
  Plane,
  Radio,
  CheckCircle2,
  Skull,
} from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { TacticalForecast } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface AttackDiscoveredIntelGridProps {
  targetNation: Nation;
  forecast: TacticalForecast;
  probBg: string;
  probColor: string;
  auxFlag: string;
  onAutoOptimizeDeploy: () => void;
}

export function AttackDiscoveredIntelGrid({
  targetNation,
  forecast,
  probBg,
  probColor,
  auxFlag,
  onAutoOptimizeDeploy,
}: AttackDiscoveredIntelGridProps) {
  const t = useTranslations("attack.intel");
  const { formatNumber, formatCurrency, formatLevel } = useLocaleFormatter();
  const aux = forecast.auxiliaryGuarantor;

  return (
    <div className="bg-gradient-to-r from-emerald-950/25 via-card to-cyan-950/20 border border-emerald-500/40 p-3.5 rounded-3xl space-y-3 shadow-lg backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={14} />
          </div>
          <span className="text-xs font-black text-foreground">
            {t("fullIntelTitle", { name: targetNation.name })}
          </span>
        </div>

        <button
          type="button"
          onClick={onAutoOptimizeDeploy}
          className="py-1.5 px-3 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-md shadow-gdp/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0"
        >
          <Sparkles size={13} />
          <span>{t("autoOptimizeDeploy")}</span>
        </button>
      </div>

      {aux && aux.isEmergencyProtectorate && (
        <div className="p-2.5 rounded-2xl flex items-center justify-between text-xs border bg-rose-950/40 border-rose-500/50 text-rose-300">
          <div className="flex items-center gap-2">
            <Skull size={16} className="text-rose-400 animate-pulse" />
            <span>
              {t("protectorateWarning", { name: aux.guarantorName })} {auxFlag}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-rose-500/20 text-rose-300 border-rose-500/30">
            {t("strikeForceBudget", {
              budget: formatCurrency(aux.initialBudgetValuation, true),
              level: formatLevel(aux.techLevel),
            })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px]">
        <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
            <Shield size={10} className="text-primary" />
            <span>{t("infantry")}</span>
          </div>
          <span className="font-extrabold text-foreground block">
            {formatNumber(targetNation.military.infantry || 0)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
            <ShieldAlert size={10} className="text-military" />
            <span>{t("armor")}</span>
          </div>
          <span className="font-extrabold text-foreground block">
            {formatNumber(targetNation.military.armor || 0)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
            <Crosshair size={10} className="text-diplomacy" />
            <span>{t("airDefense")}</span>
          </div>
          <span className="font-extrabold text-foreground block">
            {formatNumber(targetNation.military.airDefense || 0)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
            <Plane size={10} className="text-gdp" />
            <span>{t("airForce")}</span>
          </div>
          <span className="font-extrabold text-foreground block">
            {formatNumber(targetNation.military.airForce || 0)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-2 rounded-xl text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[9px] font-sans">
            <Radio size={10} className="text-treasury" />
            <span>{t("droneMissile")}</span>
          </div>
          <span className="font-extrabold text-foreground block">
            {formatNumber(targetNation.military.droneMissile || 0)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/40 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-sans">
            {t("threePhaseForecast")}
          </span>
          <span className="text-[10px] text-foreground font-sans bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/50">
            {forecast.isCapitulationPredicted
              ? t("capitulationPredicted")
              : forecast.isVictoryPredicted
                ? t("tacticalVictoryPredicted")
                : t("groundDefeatPredicted")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-sans">
            {t("finalPrediction")}
          </span>
          <span
            className={`font-black text-xs px-2.5 py-0.5 rounded-xl border ${probBg} ${probColor}`}
          >
            {forecast.winProbability === 100
              ? t("decisiveWin")
              : t("decisiveLoss")}
          </span>
        </div>
      </div>
    </div>
  );
}
