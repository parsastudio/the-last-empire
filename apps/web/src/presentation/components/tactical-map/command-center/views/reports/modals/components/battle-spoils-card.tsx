import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  Coins,
  Globe2,
  Users,
  Building2,
  ShieldAlert,
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
  const loserName = isAttackerWin ? defenderName : attackerName;

  const isHumanWinner =
    (humanNationId === reportData.attackerId && isAttackerWin) ||
    (humanNationId === reportData.defenderId && !isAttackerWin);

  const capturedUnitsList = [
    {
      label: "لشکر پیاده‌نظام اسیرشده",
      count: spoils?.capturedInfantry || 0,
      icon: "🪖",
    },
    {
      label: "تانک و خودروهای زرهی غنیمتی",
      count: spoils?.capturedArmor || 0,
      icon: "🛡️",
    },
    {
      label: "سامانه‌های پدافند هوایی تصاحب‌شده",
      count: spoils?.capturedAirDefense || 0,
      icon: "🎯",
    },
    {
      label: "جنگنده‌های برتری هوایی سالم",
      count: spoils?.capturedAirForce || 0,
      icon: "🛩️",
    },
    {
      label: "پهپادها و زرادخانه موشکی به غنیمت‌رفته",
      count: spoils?.capturedDrones || 0,
      icon: "🚀",
    },
    {
      label: "ناوگان و ادوات دریایی تسخیرشده",
      count: spoils?.capturedNavalFleet || 0,
      icon: "⚓",
    },
  ].filter((u) => u.count > 0);

  return (
    <div className="space-y-5 font-sans text-right dir-rtl animate-fade-smooth">
      <div
        className={`p-5 rounded-3xl border flex items-center justify-between shadow-2xl ${
          isHumanWinner
            ? "bg-gradient-to-r from-amber-500/20 via-card to-amber-500/10 border-amber-500/50 text-foreground"
            : "bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border-border/80 text-foreground"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-4xl shadow-inner select-none shrink-0">
            {winnerFlag}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              <h3 className="text-base font-black text-foreground">
                غنائم، فتوحات ارضی و الحاق قلمرو به امپراتوری {winnerName}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {reportData.isFullCapitulation
                ? `با انهدام و تسلیم کامل دولت ${loserName}، تمامیت ارضی، خزانه و باقیمانده زرادخانه به خاک کشور فاتح ضمیمه شد.`
                : `در نتیجه شکست ارتش ${loserName}، استان هدف و خزانه‌داری مستقر تسخیر و به حاکمیت فاتح پیوست.`}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center justify-center font-mono bg-background/80 border border-border/70 px-4 py-2.5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-muted-foreground">وضعیت حقوقی</span>
          <span className="text-xs font-black text-amber-400">
            الحاق قطعی ⚔️
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
        <div className="bg-card/90 border border-border/80 p-4.5 rounded-3xl space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Globe2 size={15} className="text-primary" />
              <span>مساحت سرزمین فتح‌شده:</span>
            </span>
            <span>🗺️</span>
          </div>
          <span className="text-xl font-black text-foreground block">
            {PersianNumberFormatter.formatNumberWithCommas(
              spoils?.conqueredPixels || 0,
            )}{" "}
            پیکسل
          </span>
          <span className="text-[10px] text-muted-foreground font-sans block">
            شامل{" "}
            {PersianNumberFormatter.toPersianDigits(
              spoils?.conqueredProvincesCount || 0,
            )}{" "}
            استان
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-4.5 rounded-3xl space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Users size={15} className="text-primary" />
              <span>جمعیت الحاق‌شده:</span>
            </span>
            <span>👥</span>
          </div>
          <span className="text-xl font-black text-foreground block">
            {PersianNumberFormatter.formatCompactNumber(
              spoils?.gainedPopulation || 0,
            )}{" "}
            نفر
          </span>
          <span className="text-[10px] text-gdp font-sans block">
            افزایش نرخ نیروی کار کشور
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-4.5 rounded-3xl space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Building2 size={15} className="text-gdp" />
              <span>تولید ناخالص (GDP) افزوده:</span>
            </span>
            <span>📈</span>
          </div>
          <span className="text-xl font-black text-gdp block">
            +
            {PersianNumberFormatter.formatCurrency(
              spoils?.gainedGdp || 0,
              true,
            )}
          </span>
          <span className="text-[10px] text-muted-foreground font-sans block">
            رشد مستقیم پایه اقتصادی
          </span>
        </div>

        <div className="bg-card/90 border border-border/80 p-4.5 rounded-3xl space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Coins size={15} className="text-treasury" />
              <span>غارت خزانه‌داری حریف:</span>
            </span>
            <span>💰</span>
          </div>
          <span className="text-xl font-black text-amber-400 block">
            +
            {PersianNumberFormatter.formatCurrency(
              spoils?.lootedTreasury || 0,
              true,
            )}
          </span>
          <span className="text-[10px] text-muted-foreground font-sans block">
            واریز آنی به خزانه ملی فاتح
          </span>
        </div>
      </div>

      {spoils?.conqueredProvincesNames &&
        spoils.conqueredProvincesNames.length > 0 && (
          <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Flag size={15} className="text-primary" />
              <span>فهرست استان‌های به کنترل درآمده:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {spoils.conqueredProvincesNames.map((name, idx) => (
                <span
                  key={idx}
                  className="bg-secondary/70 border border-border/70 px-3 py-1 rounded-xl text-xs font-bold font-sans text-foreground flex items-center gap-1.5 shadow-sm"
                >
                  <span>📍</span>
                  <span>استان {name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

      {capturedUnitsList.length > 0 ? (
        <div className="bg-card/95 border border-border/80 rounded-3xl overflow-hidden shadow-2xl space-y-0">
          <div className="p-4 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h4 className="text-sm font-black text-foreground">
                غنائم تسلیحاتی اسیرشده و ادغام‌شده در زرادخانه ارتش فاتح
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-bold">
              ادغام فوری در ارتش ⚡
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
            {capturedUnitsList.map((item, idx) => (
              <div
                key={idx}
                className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span className="text-xl select-none">{item.icon}</span>
                  <span className="font-sans">{item.label}</span>
                </div>
                <span className="text-sm font-black font-mono text-emerald-400">
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    item.count.toLocaleString("en-US"),
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-secondary/30 border border-border/60 rounded-2xl text-center text-xs text-muted-foreground">
          هیچ جنگ‌افزار سالمی از جبهه نبرد به اسارت درنیامد (تمامی ادوات دشمن در
          درگیری منهدم شدند).
        </div>
      )}
    </div>
  );
}
