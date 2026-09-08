import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import {
  Flame,
  ShieldCheck,
  Ban,
  Factory,
  Radio,
  Crosshair,
  ShieldAlert,
  Info,
} from "lucide-react";

interface BattlePhaseMissileCardProps {
  reportData: BattleFullReportData;
  attackerName: string;
  defenderName: string;
  attackerFlag: string;
  defenderFlag: string;
}

export function BattlePhaseMissileCard({
  reportData,
  attackerName,
  defenderName,
  attackerFlag,
  defenderFlag,
}: BattlePhaseMissileCardProps) {
  const aux = reportData.auxiliaryGuarantor;
  const auxFlag = aux
    ? getFlagEmoji(aux.guarantorFlagCode || aux.guarantorId)
    : "";

  const isSkipped =
    reportData.phase1Missile.phaseWinner === "SKIPPED" ||
    reportData.phase1Missile.dronesLaunched === 0;

  if (isSkipped) {
    return (
      <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
        <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/80 flex items-center justify-center text-xl border border-border">
              🚀
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                فاز اول: ضربات موشکی پیش‌دستانه و مصاف با شبکه پدافند
              </h3>
              <span className="text-[10px] text-muted-foreground">
                سرکوب پدافند هوایی و بمباران راهبردی کارخانجات صنعتی
              </span>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-2xl text-xs font-black border bg-secondary/80 text-muted-foreground border-border/70 flex items-center gap-1.5 shadow-sm">
            <Ban size={14} />
            <span>عملیات موشکی انجام نشد</span>
          </span>
        </div>

        <div className="p-8 bg-card/60 border border-border/60 rounded-3xl flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-2xl shadow-inner border border-border/40">
            🚫
          </div>
          <span className="text-sm font-bold text-foreground block">
            هیچ موشک بالستیک یا پهپاد انتحاری در این تهاجم شلیک نگردید
          </span>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            فرماندهی تهاجم بدون اجرای آتش موشکی پیش‌دستانه، مستقیماً وارد فاز
            درگیری‌های هوایی و پیشروی زمینی شد.
          </p>
        </div>
      </div>
    );
  }

  const isAttackerWin = reportData.phase1Missile.phaseWinner === "ATTACKER";
  const missilesLaunched = reportData.phase1Missile.dronesLaunched;
  const missilesIntercepted = reportData.phase1Missile.dronesIntercepted;
  const missilesPenetrated = Math.max(
    0,
    missilesLaunched - missilesIntercepted,
  );
  const airDefenseLost = reportData.phase1Missile.airDefenseLost;
  const factoriesDestroyed = reportData.phase1Missile.destroyedFactories;
  const destructionScope = reportData.phase1Missile.factoryDestructionScope;

  return (
    <div className="space-y-4 font-sans text-right dir-rtl animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-xl text-rose-400">
            🚀
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              فاز اول: ضربات موشکی پیش‌دستانه و مصاف با شبکه پدافند
            </h3>
            <span className="text-[10px] text-muted-foreground">
              رهگیری موشک‌ها، سرکوب آتشبار پدافندی و انهدام کارخانجات
            </span>
          </div>
        </div>
        <span
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 shadow-sm ${
            isAttackerWin
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
          }`}
        >
          {isAttackerWin ? <Flame size={15} /> : <ShieldCheck size={15} />}
          <span>
            {isAttackerWin
              ? `نفوذ موفق موشک‌های ${attackerName}`
              : `دفع آتش توسط پدافند ${defenderName}`}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/90 border border-primary/40 p-5 rounded-3xl space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-primary flex items-center gap-2">
              <span className="text-xl">{attackerFlag}</span>
              <span>عملیات پرتابی {attackerName}</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-lg">
              یگان موشکی
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Radio size={13} className="text-primary" />
                <span>کل موشک‌ها و پهپادهای شلیک‌شده:</span>
              </span>
              <span className="font-black text-foreground text-sm">
                {PersianNumberFormatter.formatNumberWithCommas(
                  missilesLaunched,
                )}{" "}
                فروند 🚀
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>شکار و رهگیری‌شده توسط پدافند:</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {PersianNumberFormatter.formatNumberWithCommas(
                  missilesIntercepted,
                )}{" "}
                فروند 💥
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" />
                <span>موشک‌های عبورکرده و اصابت به هدف:</span>
              </span>
              <span className="font-black text-emerald-400 text-sm">
                {PersianNumberFormatter.formatNumberWithCommas(
                  missilesPenetrated,
                )}{" "}
                فروند 🎯
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-military/40 p-5 rounded-3xl space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-sm font-black text-military flex items-center gap-2">
              <span className="text-xl">{defenderFlag}</span>
              <span>شبکه پدافندی و خسارات {defenderName}</span>
            </span>
            {aux && aux.isEmergencyProtectorate ? (
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border bg-rose-950/40 text-rose-300 border-rose-500/40">
                <span>{auxFlag}</span>
                <span>
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    aux.deployedAirDefense,
                  )}{" "}
                  پدافند تحت‌الحمایگی
                </span>
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold bg-military/10 text-military border border-military/30 px-2 py-0.5 rounded-lg">
                سپر دفاعی
              </span>
            )}
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Crosshair size={13} className="text-diplomacy" />
                <span>سامانه‌های پدافند هوایی مستقر:</span>
              </span>
              <span className="font-black text-foreground text-sm">
                {PersianNumberFormatter.formatNumberWithCommas(
                  reportData.phase1Missile.defAirDefense,
                )}{" "}
                واحد 🛡️
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-rose-400" />
                <span>آتشبار پدافند نابودشده در حمله:</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {airDefenseLost > 0
                  ? `-${PersianNumberFormatter.formatNumberWithCommas(airDefenseLost)} واحد 💥`
                  : "بدون تلفات"}
              </span>
            </div>

            <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                <Factory size={13} className="text-amber-400" />
                <span>کارخانجات و زیرساخت‌های تخریب‌شده:</span>
              </span>
              <span className="font-black text-rose-400 text-sm">
                {factoriesDestroyed > 0
                  ? `-${PersianNumberFormatter.formatNumberWithCommas(factoriesDestroyed)} سوله 🏭`
                  : "بدون خسارت صنعتی"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {factoriesDestroyed > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-foreground/90 shadow-sm">
          <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-right">
            <span className="font-black text-amber-400 block">
              دامنه جغرافیایی تخریب کارخانجات:
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {destructionScope === "OTHER_PROVINCES"
                ? `از آنجا که استان هدف در آستانه تصرف قرار دارد، موشک‌های مهاجم خطوط تولید را در «سایر استان‌های کشور ${defenderName}» بمباران و تخریب کردند تا زیرساخت استان فتح‌شده برای شما سالم بماند.`
                : `تعداد ${PersianNumberFormatter.formatNumberWithCommas(factoriesDestroyed)} سوله کارخانه به صورت متوازن در «تمامی استان‌های صنعتی کشور ${defenderName}» تخریب شد.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
