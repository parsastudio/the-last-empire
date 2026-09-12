import React from "react";
import { useTranslations } from "next-intl";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { Swords } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface BattlePhaseGroundCardProps {
  reportData: BattleFullReportData;
  attackerName: string;
  defenderName: string;
  attackerFlag: string;
  defenderFlag: string;
}

export function BattlePhaseGroundCard({
  reportData,
  attackerName,
  defenderName,
  attackerFlag,
  defenderFlag,
}: BattlePhaseGroundCardProps) {
  const t = useTranslations("reports.phase3");
  const { formatNumber, toDigits } = useLocaleFormatter();
  const aux = reportData.auxiliaryGuarantor;
  const auxFlag = aux
    ? getFlagEmoji(aux.guarantorFlagCode || aux.guarantorId)
    : "";
  const isAttackerWin = reportData.phase3Ground.phaseWinner === "ATTACKER";
  const winnerName = isAttackerWin ? attackerName : defenderName;

  return (
    <div className="space-y-4 font-sans text-start animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <h3 className="text-sm font-black text-foreground">{t("title")}</h3>
        </div>
        <span
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 ${
            isAttackerWin
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
          }`}
        >
          <Swords size={15} />
          <span>{t("winnerLabel", { name: winnerName })}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/90 border border-primary/40 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-primary flex items-center gap-2">
              <span>{attackerFlag}</span>
              <span>{t("attackerBranch", { name: attackerName })}</span>
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {t("invasionForces")}
            </span>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                {t("attArmor")}
              </span>
              <span className="font-black text-foreground text-base">
                {formatNumber(reportData.phase3Ground.attArmor)}{" "}
                {t("armorUnit")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                {t("attArmorLost")}
              </span>
              <span className="font-black text-rose-400 text-base">
                -{formatNumber(reportData.phase3Ground.attArmorLost)}{" "}
                {t("armorLostUnit")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1 border-t border-border/30">
              <span className="text-muted-foreground font-sans">
                {t("attInfantry")}
              </span>
              <span className="font-black text-foreground text-base">
                {formatNumber(reportData.phase3Ground.attInfantry)}{" "}
                {t("infantryUnit")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                {t("attInfantryLost")}
              </span>
              <span className="font-black text-rose-400 text-base">
                -{formatNumber(reportData.phase3Ground.attInfantryLost)}{" "}
                {t("infantryLostUnit")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-military/40 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-military flex items-center gap-2">
              <span>{defenderFlag}</span>
              <span>{t("defenderBranch", { name: defenderName })}</span>
            </span>
            {aux && aux.isEmergencyProtectorate && (
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border bg-rose-950/40 text-rose-300 border-rose-500/40">
                <span>{auxFlag}</span>
                <span>
                  {t("auxGround", {
                    armor: toDigits(aux.deployedArmor),
                    infantry: toDigits(aux.deployedInfantry),
                  })}
                </span>
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                {t("defArmor")}
              </span>
              <span className="font-black text-foreground text-base">
                {formatNumber(reportData.phase3Ground.defArmor)}{" "}
                {t("armorUnit")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                {t("defArmorLost")}
              </span>
              <span className="font-black text-rose-400 text-base">
                -{formatNumber(reportData.phase3Ground.defArmorLost)}{" "}
                {t("armorLostUnit")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1 border-t border-border/30">
              <span className="text-muted-foreground font-sans">
                {t("defInfantry")}
              </span>
              <span className="font-black text-foreground text-base">
                {formatNumber(reportData.phase3Ground.defInfantry)}{" "}
                {t("infantryUnit")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                {t("defInfantryLost")}
              </span>
              <span className="font-black text-rose-400 text-base">
                -{formatNumber(reportData.phase3Ground.defInfantryLost)}{" "}
                {t("infantryLostUnit")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
