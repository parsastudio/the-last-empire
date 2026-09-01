import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import {
  Plane,
  Flame,
  ShieldAlert,
  Crosshair,
  ShieldCheck,
  Ban,
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
  const aux = reportData.auxiliaryGuarantor;
  const auxFlag = aux
    ? getFlagEmoji(aux.guarantorFlagCode || aux.guarantorId)
    : "";

  const isSkipped =
    reportData.phase2Air.attAirForce === 0 &&
    reportData.phase2Air.defAirForce === 0;

  if (isSkipped) {
    return (
      <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
        <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/80 flex items-center justify-center text-xl border border-border">
              🛩️
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                فاز دوم: نبرد سنگین برتری هوایی، داگ‌فایت و بمباران تانک‌ها
              </h3>
              <span className="text-[10px] text-muted-foreground">
                حاکمیت بر آسمان و پاکسازی ستون‌های زرهی مدافع
              </span>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-2xl text-xs font-black border bg-secondary/80 text-muted-foreground border-border/70 flex items-center gap-1.5 shadow-sm">
            <Ban size={14} />
            <span>نبرد هوایی انجام نشد</span>
          </span>
        </div>

        <div className="p-8 bg-card/60 border border-border/60 rounded-3xl flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-2xl shadow-inner border border-border/40">
            🚫
          </div>
          <span className="text-sm font-bold text-foreground block">
            هیچ اسکادران جنگنده‌ای در آسمان حضور نداشت
          </span>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            طرفین نبرد بدون اعزام نیروی هوایی، نتیجه سرنوشت‌ساز را به صف‌آرایی
            لشکرهای زرهی و پیاده‌نظام در فاز سوم سپردند.
          </p>
        </div>
      </div>
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
    <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400">
            🛩️
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              فاز دوم: نبرد سنگین برتری هوایی، داگ‌فایت و بمباران تانک‌ها
            </h3>
            <span className="text-[10px] text-muted-foreground">
              مصاف شکاری‌ها، دفاع پدافند و بمباران ادوات زرهی
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
              ? `برتری مطلق هوایی ${attackerName}`
              : isDefenderWin
                ? `برتری هوایی و پدافندی ${defenderName}`
                : "موازنه هوایی بدون برتری قاطع"}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/90 border border-primary/40 p-5 rounded-3xl space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-primary flex items-center gap-2">
              <span className="text-xl">{attackerFlag}</span>
              <span>اسکادران‌های هوایی {attackerName}</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-lg">
              هواگردهای مهاجم
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Plane size={13} className="text-primary" />
                <span>جنگنده‌های اعزامی به صحنه نبرد:</span>
              </span>
              <span className="font-black text-foreground text-sm">
                {PersianNumberFormatter.formatNumberWithCommas(attTotalAir)}{" "}
                فروند 🛩️
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" />
                <span>ساقط‌شده در نبرد تن‌به‌تن (Dogfight):</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {attLostDogfight > 0
                  ? `-${PersianNumberFormatter.formatNumberWithCommas(attLostDogfight)} فروند 💥`
                  : "بدون تلفات"}
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Crosshair size={13} className="text-diplomacy" />
                <span>هدف‌قرارگرفته توسط پدافند دشمن:</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {attLostAirDefense > 0
                  ? `-${PersianNumberFormatter.formatNumberWithCommas(attLostAirDefense)} فروند 🎯`
                  : "۰ فروند"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-military/40 p-5 rounded-3xl space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-military flex items-center gap-2">
              <span className="text-xl">{defenderFlag}</span>
              <span>نیروی هوایی و تلفات {defenderName}</span>
            </span>
            {aux ? (
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
            ) : (
              <span className="text-[10px] font-mono font-bold bg-military/10 text-military border border-military/30 px-2 py-0.5 rounded-lg">
                آرایش مدافع
              </span>
            )}
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Plane size={13} className="text-military" />
                <span>جنگنده‌های رهگیر پایگاه دفاعی:</span>
              </span>
              <span className="font-black text-foreground text-sm">
                {PersianNumberFormatter.formatNumberWithCommas(defTotalAir)}{" "}
                فروند 🛩️
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Flame size={13} className="text-rose-400" />
                <span>جنگنده‌های ساقط‌شده در آسمان:</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {defAirLost > 0
                  ? `-${PersianNumberFormatter.formatNumberWithCommas(defAirLost)} فروند 💥`
                  : "بدون تلفات"}
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Zap size={13} className="text-emerald-400" />
                <span>تانک‌های بمباران و منهدم‌شده مدافع:</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {defArmorDestroyedByAir > 0
                  ? `-${PersianNumberFormatter.formatNumberWithCommas(defArmorDestroyedByAir)} واحد 🛡️`
                  : "بدون بمباران زرهی"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {defArmorDestroyedByAir > 0 && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-foreground shadow-sm">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-emerald-400" />
            <span>
              پشتیبانی نزدیک هوایی (CAS): جنگنده‌های {attackerName} قبل از رسیدن
              نیروهای زمینی، ستون‌های زرهی مدافع را زیر آتش گرفتند.
            </span>
          </div>
          <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
            {PersianNumberFormatter.formatNumberWithCommas(
              defArmorDestroyedByAir,
            )}{" "}
            تانک منهدم شد
          </span>
        </div>
      )}
    </div>
  );
}
