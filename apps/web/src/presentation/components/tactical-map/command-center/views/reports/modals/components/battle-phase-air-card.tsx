import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { Flame, ShieldAlert } from "lucide-react";

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
  const aux = reportData.auxiliaryGuarantor;
  const auxFlag = aux
    ? getFlagEmoji(aux.guarantorFlagCode || aux.guarantorId)
    : "";
  const isAttackerWin = reportData.phase2Air.phaseWinner === "ATTACKER";

  return (
    <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛩️</span>
          <h3 className="text-sm font-black text-foreground">
            فاز دوم: نبرد سنگین برتری هوایی و بمباران
          </h3>
        </div>
        <span
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 ${
            isAttackerWin
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
          }`}
        >
          {isAttackerWin ? <Flame size={15} /> : <ShieldAlert size={15} />}
          <span>برتری هوایی {isAttackerWin ? attackerName : defenderName}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/90 border border-primary/40 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-primary flex items-center gap-2">
              <span>{attackerFlag}</span>
              <span>نیروی هوایی {attackerName}</span>
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              اسکادران مهاجم
            </span>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                جنگنده‌های اعزامی:
              </span>
              <span className="font-black text-foreground text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase2Air.attAirForce,
                )}{" "}
                فروند 🛩️
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                جنگنده‌های ساقط‌شده:
              </span>
              <span className="font-black text-rose-400 text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase2Air.attAirLost,
                )}{" "}
                فروند 💥
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-military/40 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-military flex items-center gap-2">
              <span>{defenderFlag}</span>
              <span>نیروی هوایی {defenderName}</span>
            </span>
            {aux && (
              <span
                className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                  aux.isEmergencyProtectorate
                    ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                    : "bg-cyan-950/40 text-cyan-400 border-cyan-500/30"
                }`}
              >
                <span>{auxFlag}</span>
                <span>
                  +
                  {PersianNumberFormatter.toPersianDigits(aux.deployedAirForce)}{" "}
                  جنگنده{" "}
                  {aux.isEmergencyProtectorate ? "تحت‌الحمایگی" : "چتر امنیتی"}
                </span>
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                جنگنده‌های پایگاه:
              </span>
              <span className="font-black text-foreground text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase2Air.defAirForce,
                )}{" "}
                فروند 🛩️
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                جنگنده‌های ساقط‌شده:
              </span>
              <span className="font-black text-rose-400 text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase2Air.defAirLost,
                )}{" "}
                فروند 💥
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
