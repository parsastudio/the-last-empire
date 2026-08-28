import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { Swords, ShieldCheck, Flame, ShieldAlert, Ban } from "lucide-react";

interface BattlePhaseCardsProps {
  activeStep: 1 | 2 | 3;
  reportData: BattleFullReportData;
  attackerName: string;
  defenderName: string;
  attackerFlag: string;
  defenderFlag: string;
}

export function BattlePhaseCards({
  activeStep,
  reportData,
  attackerName,
  defenderName,
  attackerFlag,
  defenderFlag,
}: BattlePhaseCardsProps) {
  const aux = reportData.auxiliaryGuarantor;
  const auxFlag = aux
    ? getFlagEmoji(aux.guarantorFlagCode || aux.guarantorId)
    : "";

  if (activeStep === 1) {
    const isSkipped =
      reportData.phase1Missile.phaseWinner === "SKIPPED" ||
      reportData.phase1Missile.dronesLaunched === 0;

    if (isSkipped) {
      return (
        <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
          <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-sm font-black text-foreground">
                فاز اول: ضربات موشکی و مصاف با شبکه پدافند
              </h3>
            </div>
            <span className="px-3.5 py-1.5 rounded-2xl text-xs font-black border bg-secondary/80 text-muted-foreground border-border/70 flex items-center gap-1.5">
              <Ban size={14} />
              <span>عملیات موشکی انجام نشد</span>
            </span>
          </div>

          <div className="p-8 bg-card/60 border border-border/60 rounded-3xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl shadow-inner">
              🚫
            </div>
            <span className="text-sm font-bold text-foreground block">
              هیچ موشک یا پهپادی در این تهاجم شلیک نگردید
            </span>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              فرماندهی تهاجم بدون اجرای آتش موشکی پیش‌دستانه، مستقیماً وارد فاز
              درگیری‌های هوایی و زمینی شد.
            </p>
          </div>
        </div>
      );
    }

    const isAttackerWin = reportData.phase1Missile.phaseWinner === "ATTACKER";
    return (
      <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
        <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <h3 className="text-sm font-black text-foreground">
              فاز اول: ضربات موشکی و مصاف با شبکه پدافند
            </h3>
          </div>
          <span
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 ${
              isAttackerWin
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border-rose-500/40"
            }`}
          >
            {isAttackerWin ? <Flame size={15} /> : <ShieldCheck size={15} />}
            <span>برتری با {isAttackerWin ? attackerName : defenderName}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card/90 border border-primary/40 p-5 rounded-3xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <span className="text-sm font-black text-primary flex items-center gap-2">
                <span>{attackerFlag}</span>
                <span>عملیات پرتابی {attackerName}</span>
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                یگان مهاجم
              </span>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-sans">
                  تعداد پرتابه‌ها:
                </span>
                <span className="font-black text-foreground text-base">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.dronesLaunched,
                  )}{" "}
                  فروند 🚀
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-sans">
                  موشک‌های منهدم‌شده:
                </span>
                <span className="font-black text-rose-400 text-base">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.dronesIntercepted,
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
                <span>سپر موشکی {defenderName}</span>
              </span>
              {aux && (
                <span className="text-[10px] font-sans font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <span>{auxFlag}</span>
                  <span>
                    +
                    {PersianNumberFormatter.toPersianDigits(
                      aux.deployedAirDefense,
                    )}{" "}
                    پدافند چتر امنیتی
                  </span>
                </span>
              )}
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-sans">
                  سامانه‌های فعال:
                </span>
                <span className="font-black text-foreground text-base">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.defAirDefense,
                  )}{" "}
                  واحد 🛡️
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-sans">
                  پدافند نابودشده:
                </span>
                <span className="font-black text-rose-400 text-base">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.airDefenseLost,
                  )}{" "}
                  واحد 💥
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeStep === 2) {
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
            <span>
              برتری هوایی {isAttackerWin ? attackerName : defenderName}
            </span>
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
                <span className="text-[10px] font-sans font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <span>{auxFlag}</span>
                  <span>
                    +
                    {PersianNumberFormatter.toPersianDigits(
                      aux.deployedAirForce,
                    )}{" "}
                    جنگنده چتر امنیتی
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

  const isAttackerWin = reportData.phase3Ground.phaseWinner === "ATTACKER";
  return (
    <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <h3 className="text-sm font-black text-foreground">
            فاز سوم: پیشروی زرهی و برخورد خونین خطوط پیاده‌نظام
          </h3>
        </div>
        <span
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 ${
            isAttackerWin
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
          }`}
        >
          <Swords size={15} />
          <span>
            فاتح خط مقدم: {isAttackerWin ? attackerName : defenderName}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/90 border border-primary/40 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-primary flex items-center gap-2">
              <span>{attackerFlag}</span>
              <span>لشکرهای زمینی {attackerName}</span>
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              نیروهای تهاجم
            </span>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                تانک‌های زرهی واردشده:
              </span>
              <span className="font-black text-foreground text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.attArmor,
                )}{" "}
                واحد 🛡️
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                تلفات زرهی:
              </span>
              <span className="font-black text-rose-400 text-base">
                -
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.attArmorLost,
                )}{" "}
                واحد 💥
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1 border-t border-border/30">
              <span className="text-muted-foreground font-sans">
                پیاده‌نظام خط‌شکن:
              </span>
              <span className="font-black text-foreground text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.attInfantry,
                )}{" "}
                لشکر 🪖
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                تلفات پیاده‌نظام:
              </span>
              <span className="font-black text-rose-400 text-base">
                -
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.attInfantryLost,
                )}{" "}
                لشکر ☠️
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-military/40 p-5 rounded-3xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-military flex items-center gap-2">
              <span>{defenderFlag}</span>
              <span>لشکرهای مدافع {defenderName}</span>
            </span>
            {aux && (
              <span className="text-[10px] font-sans font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>{auxFlag}</span>
                <span>
                  +{PersianNumberFormatter.toPersianDigits(aux.deployedArmor)}{" "}
                  تانک، +
                  {PersianNumberFormatter.toPersianDigits(aux.deployedInfantry)}{" "}
                  پیاده چتر
                </span>
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                تانک‌های زرهی مدافع:
              </span>
              <span className="font-black text-foreground text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.defArmor,
                )}{" "}
                واحد 🛡️
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                تلفات زرهی:
              </span>
              <span className="font-black text-rose-400 text-base">
                -
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.defArmorLost,
                )}{" "}
                واحد 💥
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1 border-t border-border/30">
              <span className="text-muted-foreground font-sans">
                پیاده‌نظام مدافع سنگرها:
              </span>
              <span className="font-black text-foreground text-base">
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.defInfantry,
                )}{" "}
                لشکر 🪖
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-sans">
                تلفات پیاده‌نظام:
              </span>
              <span className="font-black text-rose-400 text-base">
                -
                {PersianNumberFormatter.toPersianDigits(
                  reportData.phase3Ground.defInfantryLost,
                )}{" "}
                لشکر ☠️
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
