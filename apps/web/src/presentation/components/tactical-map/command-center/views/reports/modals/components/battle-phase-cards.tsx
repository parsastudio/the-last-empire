import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Swords, ShieldCheck, Flame, ShieldAlert } from "lucide-react";

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
  if (activeStep === 1) {
    const isAttackerWin = reportData.phase1Missile.phaseWinner === "ATTACKER";
    return (
      <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
        <div className="bg-secondary/40 border border-border/80 p-4.5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <div>
              <h3 className="text-base font-black text-foreground">
                فاز اول: ضربات موشکی و مصاف با شبکه پدافند
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                حمله پهپادها و موشک‌های دوربرد به پایگاه‌های راداری و پدافند
                هوایی
              </p>
            </div>
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
              <span className="text-xs font-mono font-bold text-muted-foreground">
                پدافند مدافع
              </span>
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
        <div className="bg-secondary/40 border border-border/80 p-4.5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛩️</span>
            <div>
              <h3 className="text-base font-black text-foreground">
                فاز دوم: نبرد سنگین برتری هوایی و بمباران
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                داگ‌فایت جنگنده‌ها و بمباران مواضع زرهی و تانک‌های دشمن از آسمان
              </p>
            </div>
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
              <span className="text-xs font-mono font-bold text-muted-foreground">
                اسکادران مدافع
              </span>
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

        {reportData.phase2Air.defArmorDestroyedByAir > 0 && (
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-400 font-mono">
            <span className="flex items-center gap-2 font-sans">
              <span>🔥</span>
              <span>شکار تانک‌های دشمن از آسمان توسط نیروی هوایی مهاجم:</span>
            </span>
            <span className="text-sm font-black">
              {PersianNumberFormatter.toPersianDigits(
                reportData.phase2Air.defArmorDestroyedByAir,
              )}{" "}
              تانک منهدم شد 💥
            </span>
          </div>
        )}
      </div>
    );
  }

  const isAttackerWin = reportData.phase3Ground.phaseWinner === "ATTACKER";
  return (
    <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4.5 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚔️</span>
          <div>
            <h3 className="text-base font-black text-foreground">
              فاز سوم: پیشروی زرهی و برخورد خونین خطوط پیاده‌نظام
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              درگیری تانک‌ها برای درهم شکستن خطوط دفاعی و تصرف مستقیم استان
            </p>
          </div>
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
            <span className="text-xs font-mono font-bold text-muted-foreground">
              سنگرهای دفاعی
            </span>
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
