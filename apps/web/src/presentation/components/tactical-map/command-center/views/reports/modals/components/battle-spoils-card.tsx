import React from "react";
import { useTranslations } from "next-intl";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { Trophy } from "lucide-react";
import { BattleSpoilsMetricsGrid } from "./spoils/battle-spoils-metrics-grid";
import { ConqueredProvincesList } from "./spoils/conquered-provinces-list";

interface BattleSpoilsCardProps {
  reportData: BattleFullReportData;
  attackerName: string;
  defenderName: string;
  attackerFlag: string;
  defenderFlag: string;
  humanNationId?: string;
}

export function BattleSpoilsCard({
  reportData,
  attackerName,
  defenderName,
  attackerFlag,
  defenderFlag,
  humanNationId,
}: BattleSpoilsCardProps) {
  const t = useTranslations("reports.spoils");
  const spoils = reportData.spoils;
  const isAttackerWin = reportData.isAttackerVictory;
  const winnerName = isAttackerWin ? attackerName : defenderName;
  const winnerFlag = isAttackerWin ? attackerFlag : defenderFlag;

  const isHumanWinner =
    (humanNationId === reportData.attackerId && isAttackerWin) ||
    (humanNationId === reportData.defenderId && !isAttackerWin);

  return (
    <div className="space-y-3.5 font-sans text-right dir-rtl animate-fade-smooth w-full overflow-x-hidden">
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg w-full ${
          isHumanWinner
            ? "bg-gradient-to-r from-amber-500/20 via-card to-amber-500/10 border-amber-500/50 text-foreground"
            : "bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border-border/80 text-foreground"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
            {winnerFlag}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={16} className="text-amber-400" />
              <h3 className="text-sm font-black text-foreground">
                {t("ledgerTitle", { name: winnerName })}
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {reportData.isFullCapitulation
                ? t("capitulationText")
                : t("conquestText")}
            </p>
          </div>
        </div>
      </div>

      <BattleSpoilsMetricsGrid spoils={spoils} />

      <ConqueredProvincesList
        provincesNames={spoils?.conqueredProvincesNames}
      />
    </div>
  );
}
