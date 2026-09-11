import React from "react";
import { useTranslations } from "next-intl";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Trophy, Skull } from "lucide-react";

interface BattleCasualtyTableProps {
  reportData: BattleFullReportData;
  attackerName: string;
  defenderName: string;
  attackerFlag: string;
  defenderFlag: string;
  humanNationId?: string;
}

export function BattleCasualtyTable({
  reportData,
  attackerName,
  defenderName,
  attackerFlag,
  defenderFlag,
  humanNationId,
}: BattleCasualtyTableProps) {
  const t = useTranslations("reports.casualties");
  const isAttackerWin = reportData.isAttackerVictory;
  const isHumanWinner =
    (humanNationId === reportData.attackerId && isAttackerWin) ||
    (humanNationId === reportData.defenderId && !isAttackerWin);

  const winnerName = isAttackerWin ? attackerName : defenderName;
  const winnerFlag = isAttackerWin ? attackerFlag : defenderFlag;

  const rows = [
    {
      unit: t("units.infantry"),
      attLost: reportData.attackerCasualties.infantryLost,
      defLost: reportData.defenderCasualties.infantryLost,
    },
    {
      unit: t("units.armor"),
      attLost: reportData.attackerCasualties.armorLost,
      defLost: reportData.defenderCasualties.armorLost,
    },
    {
      unit: t("units.airDefense"),
      attLost: reportData.attackerCasualties.airDefenseLost,
      defLost: reportData.defenderCasualties.airDefenseLost,
    },
    {
      unit: t("units.airForce"),
      attLost: reportData.attackerCasualties.airForceLost,
      defLost: reportData.defenderCasualties.airForceLost,
    },
    {
      unit: t("units.droneMissile"),
      attLost: reportData.attackerCasualties.droneMissileLost,
      defLost: reportData.defenderCasualties.droneMissileLost,
    },
  ];

  return (
    <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
      <div
        className={`p-5 rounded-3xl border flex items-center justify-between shadow-xl ${
          isHumanWinner
            ? "bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 border-emerald-500/50 text-foreground"
            : "bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-rose-950/40 border-rose-500/50 text-foreground"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-3xl shadow-inner">
            {winnerFlag}
          </div>
          <span className="text-base font-black flex items-center gap-2">
            {isHumanWinner ? (
              <Trophy size={18} className="text-amber-400" />
            ) : (
              <Skull size={18} className="text-rose-400" />
            )}
            <span>{t("winnerHeader", { name: winnerName })}</span>
          </span>
        </div>

        <div className="text-left font-mono space-y-0.5 dir-ltr">
          <span className="text-[10px] text-muted-foreground block uppercase">
            {t("powerRatio")}
          </span>
          <span className="text-xl font-black text-amber-400">
            {PersianNumberFormatter.toPersianDigits(reportData.valuationRatio)}
            :۱
          </span>
        </div>
      </div>

      <div className="bg-card/95 border border-border/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
          <h4 className="text-sm font-black text-foreground">
            {t("tableTitle")}
          </h4>
          <span className="text-[10px] font-mono bg-secondary px-2.5 py-1 rounded-xl text-muted-foreground border border-border/60">
            {t("tableSubtitle")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/50 font-bold text-muted-foreground text-[11px]">
                <th className="p-3.5">{t("hardwareColumn")}</th>
                <th className="p-3.5 text-center text-rose-400 font-black">
                  {t("attLossColumn", { name: attackerName })}
                </th>
                <th className="p-3.5 text-center text-rose-400 font-black">
                  {t("defLossColumn", { name: defenderName })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {rows.map((r, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="p-3.5 font-bold text-foreground font-sans">
                    {r.unit}
                  </td>
                  <td className="p-3.5 text-center font-extrabold text-rose-400 text-sm">
                    {r.attLost > 0
                      ? `-${PersianNumberFormatter.toPersianDigits(r.attLost)}`
                      : "۰"}
                  </td>
                  <td className="p-3.5 text-center font-extrabold text-rose-400 text-sm">
                    {r.defLost > 0
                      ? `-${PersianNumberFormatter.toPersianDigits(r.defLost)}`
                      : "۰"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
