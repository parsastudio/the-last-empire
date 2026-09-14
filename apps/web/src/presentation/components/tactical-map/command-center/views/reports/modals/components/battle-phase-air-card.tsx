import React from "react";
import { useTranslations } from "next-intl";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { BattlePhaseSkippedBanner } from "./battle-phase-skipped-banner";
import {
  Plane,
  Flame,
  ShieldAlert,
  Crosshair,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface BattlePhaseAirCardProps {
  reportData: BattleFullReportData;
  attackerName: string;
  defenderName: string;
  attackerFlag: string;
  defenderFlag: string;
}

export function BattlePhaseAirCard({
  reportData,
  attackerName,
  defenderName,
  attackerFlag,
  defenderFlag,
}: BattlePhaseAirCardProps) {
  const t = useTranslations("reports.phase2");
  const { formatNumber, toDigits } = useLocaleFormatter();

  const aux = reportData.auxiliaryGuarantor;
  const auxFlag = aux
    ? getFlagEmoji(aux.guarantorFlagCode || aux.guarantorId)
    : "";

  const isSkipped =
    reportData.phase2Air.attAirForce === 0 &&
    reportData.phase2Air.defAirForce === 0;

  if (isSkipped) {
    return (
      <BattlePhaseSkippedBanner
        iconEmoji="🛩️"
        title={t("title")}
        subtitle={t("subtitle")}
        skippedBadge={t("skippedBadge")}
        skippedTitle={t("skippedTitle")}
        skippedDesc={t("skippedDesc")}
      />
    );
  }

  const isAttackerWin = reportData.phase2Air.phaseWinner === "ATTACKER";
  const isDefenderWin = reportData.phase2Air.phaseWinner === "DEFENDER";
  const attTotalAir = reportData.phase2Air.attAirForce;
  const attAirLost = reportData.phase2Air.attAirLost;
  const attLostDogfight =
    reportData.phase2Air.attAirLostToDogfight ?? attAirLost;
  const attLostAirDefense = reportData.phase2Air.attAirLostToAirDefense ?? 0;

  const defTotalAir = reportData.phase2Air.defAirForce;
  const defAirLost = reportData.phase2Air.defAirLost;
  const defArmorDestroyedByAir = reportData.phase2Air.defArmorDestroyedByAir;

  return (
    <div className="space-y-4 font-sans text-start animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400">
            🛩️
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">{t("title")}</h3>
            <span className="text-[10px] text-muted-foreground">
              {t("subtitle")}
            </span>
          </div>
        </div>
        <span
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 shadow-sm ${
            isAttackerWin
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : isDefenderWin
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                : "bg-secondary text-muted-foreground border-border"
          }`}
        >
          {isAttackerWin ? (
            <Flame size={15} />
          ) : isDefenderWin ? (
            <ShieldAlert size={15} />
          ) : (
            <ShieldCheck size={15} />
          )}
          <span>
            {isAttackerWin
              ? t("winnerAttacker", { name: attackerName })
              : isDefenderWin
                ? t("winnerDefender", { name: defenderName })
                : t("winnerDraw")}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/90 border border-primary/40 p-5 rounded-3xl space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-primary flex items-center gap-2">
              <span className="text-xl">{attackerFlag}</span>
              <span>{t("attackerBranch", { name: attackerName })}</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-lg">
              {t("strikeWings")}
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Plane size={13} className="text-primary" />
                <span>{t("attAirForce")}</span>
              </span>
              <span className="font-black text-foreground text-sm">
                {formatNumber(attTotalAir)} {t("aircraftUnit")}
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" />
                <span>{t("attDogfightLost")}</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {attLostDogfight > 0
                  ? `-${formatNumber(attLostDogfight)} ${t("lostAircraftUnit")}`
                  : t("noCasualties")}
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Crosshair size={13} className="text-diplomacy" />
                <span>{t("attAirDefenseLost")}</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {attLostAirDefense > 0
                  ? `-${formatNumber(attLostAirDefense)} ${t("targetAirDefenseUnit")}`
                  : t("zeroLosses")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-military/40 p-5 rounded-3xl space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-military flex items-center gap-2">
              <span className="text-xl">{defenderFlag}</span>
              <span>{t("defenderBranch", { name: defenderName })}</span>
            </span>
            {aux && aux.isEmergencyProtectorate ? (
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border bg-rose-950/40 text-rose-300 border-rose-500/40">
                <span>{auxFlag}</span>
                <span>
                  {t("auxAirForce", {
                    count: toDigits(aux.deployedAirForce),
                  })}
                </span>
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold bg-military/10 text-military border border-military/30 px-2 py-0.5 rounded-lg">
                {t("defensiveArray")}
              </span>
            )}
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Plane size={13} className="text-military" />
                <span>{t("defAirForce")}</span>
              </span>
              <span className="font-black text-foreground text-sm">
                {formatNumber(defTotalAir)} {t("aircraftUnit")}
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Flame size={13} className="text-rose-400" />
                <span>{t("defAirLost")}</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {defAirLost > 0
                  ? `-${formatNumber(defAirLost)} ${t("lostAircraftUnit")}`
                  : t("noCasualties")}
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Zap size={13} className="text-emerald-400" />
                <span>{t("defArmorDestroyed")}</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {defArmorDestroyedByAir > 0
                  ? `-${formatNumber(defArmorDestroyedByAir)} ${t("armorDestroyedUnit")}`
                  : t("noArmorBombing")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
