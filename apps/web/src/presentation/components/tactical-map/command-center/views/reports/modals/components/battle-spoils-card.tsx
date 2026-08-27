import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  Coins,
  Globe2,
  Users,
  Building2,
  Sparkles,
  Trophy,
  Flag,
} from "lucide-react";

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
  const spoils = reportData.spoils;
  const isAttackerWin = reportData.isAttackerVictory;
  const winnerName = isAttackerWin ? attackerName : defenderName;
  const winnerFlag = isAttackerWin ? attackerFlag : defenderFlag;

  const isHumanWinner =
    (humanNationId === reportData.attackerId && isAttackerWin) ||
    (humanNationId === reportData.defenderId && !isAttackerWin);

  const capturedUnitsList = [
    {
      label: "پیاده‌نظام اسیرشده",
      count: spoils?.capturedInfantry || 0,
      icon: "🪖",
    },
    {
      label: "تانک و زرهی غنیمتی",
      count: spoils?.capturedArmor || 0,
      icon: "🛡️",
    },
    {
      label: "پدافند هوایی تصاحب‌شده",
      count: spoils?.capturedAirDefense || 0,
      icon: "🎯",
    },
    {
      label: "جنگنده‌های سالم",
      count: spoils?.capturedAirForce || 0,
      icon: "🛩️",
    },
    {
      label: "موشک و پهپاد غنیمتی",
      count: spoils?.capturedDrones || 0,
      icon: "🚀",
    },
  ].filter((u) => u.count > 0);

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
                غنائم و فتوحات ارضی امپراتوری {winnerName}
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {reportData.isFullCapitulation
                ? "تسلیم کامل دولت مقابل و الحاق کامل تمامیت ارضی، خزانه و تسلیحات به کشور فاتح."
                : "الحاق رسمی قلمرو هدف و غارت منابع به همراه الحاق ادوات به ارتش پیروز."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono w-full">
        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
            <span className="flex items-center gap-1">
              <Globe2 size={13} className="text-primary" />
              <span>مساحت خاک:</span>
            </span>
            <span>🗺️</span>
          </div>
          <span className="text-base font-black text-foreground block">
            {PersianNumberFormatter.formatNumberWithCommas(
              spoils?.conqueredPixels || 0,
            )}{" "}
            پیکسل
          </span>
          <span className="text-[9px] text-muted-foreground font-sans block">
            {PersianNumberFormatter.toPersianDigits(
              spoils?.conqueredProvincesCount || 0,
            )}{" "}
            استان
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
            <span className="flex items-center gap-1">
              <Users size={13} className="text-primary" />
              <span>جمعیت افزوده:</span>
            </span>
            <span>👥</span>
          </div>
          <span className="text-base font-black text-foreground block">
            {PersianNumberFormatter.formatCompactNumber(
              spoils?.gainedPopulation || 0,
            )}{" "}
            نفر
          </span>
          <span className="text-[9px] text-gdp font-sans block">
            رشد نیروی کار
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
            <span className="flex items-center gap-1">
              <Building2 size={13} className="text-gdp" />
              <span>GDP افزوده:</span>
            </span>
            <span>📈</span>
          </div>
          <span className="text-base font-black text-gdp block">
            +
            {PersianNumberFormatter.formatCurrency(
              spoils?.gainedGdp || 0,
              true,
            )}
          </span>
          <span className="text-[9px] text-muted-foreground font-sans block">
            پایه اقتصادی
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
            <span className="flex items-center gap-1">
              <Coins size={13} className="text-treasury" />
              <span>غارت خزانه:</span>
            </span>
            <span>💰</span>
          </div>
          <span className="text-base font-black text-amber-400 block">
            +
            {PersianNumberFormatter.formatCurrency(
              spoils?.lootedTreasury || 0,
              true,
            )}
          </span>
          <span className="text-[9px] text-muted-foreground font-sans block">
            واریز به خزانه
          </span>
        </div>
      </div>

      {spoils?.conqueredProvincesNames &&
        spoils.conqueredProvincesNames.length > 0 && (
          <div className="bg-card/90 border border-border/80 p-3 rounded-2xl space-y-2 w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Flag size={13} className="text-primary" />
              <span>استان‌های تصرف‌شده:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {spoils.conqueredProvincesNames.map((name, idx) => {
                const formattedName = name.startsWith("استان")
                  ? name
                  : `استان ${name}`;
                return (
                  <span
                    key={idx}
                    className="bg-secondary/70 border border-border/70 px-2.5 py-1 rounded-xl text-xs font-bold font-sans text-foreground flex items-center gap-1.5 shadow-sm"
                  >
                    <span>📍</span>
                    <span>{formattedName}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

      {capturedUnitsList.length > 0 ? (
        <div className="bg-card/95 border border-border/80 rounded-2xl overflow-hidden shadow-md w-full">
          <div className="p-3 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <h4 className="text-xs font-black text-foreground">
                غنائم تسلیحاتی اسیرشده
              </h4>
            </div>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              ادغام فوری ⚡
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 w-full">
            {capturedUnitsList.map((item, idx) => (
              <div
                key={idx}
                className="bg-secondary/40 border border-border/60 p-2.5 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                  <span className="text-base select-none">{item.icon}</span>
                  <span className="font-sans truncate">{item.label}</span>
                </div>
                <span className="text-xs font-black font-mono text-emerald-400">
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    item.count.toLocaleString("en-US"),
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
