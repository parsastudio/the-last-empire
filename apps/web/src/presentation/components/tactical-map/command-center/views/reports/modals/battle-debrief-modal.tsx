"use client";

import React, { useState } from "react";
import {
  Swords,
  Shield,
  Plane,
  Radio,
  Crosshair,
  ShieldAlert,
  Coins,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Skull,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface BattleDebriefModalProps {
  isOpen: boolean;
  reportData: BattleFullReportData | null;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  onClose: () => void;
}

export function BattleDebriefModal({
  isOpen,
  reportData,
  nationsMap,
  humanNationId,
  onClose,
}: BattleDebriefModalProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  if (!isOpen || !reportData) return null;

  const attacker = nationsMap?.[reportData.attackerId];
  const defender = nationsMap?.[reportData.defenderId];

  const attackerName = attacker ? attacker.name : reportData.attackerId;
  const defenderName = defender ? defender.name : reportData.defenderId;

  const attackerFlag = getFlagEmoji(
    attacker?.flagCode || reportData.attackerId,
  );
  const defenderFlag = getFlagEmoji(
    defender?.flagCode || reportData.defenderId,
  );

  const isAttackerWinner = reportData.isAttackerVictory;
  const winnerName = isAttackerWinner ? attackerName : defenderName;
  const winnerFlag = isAttackerWinner ? attackerFlag : defenderFlag;

  const isHumanWinner =
    (humanNationId === reportData.attackerId && isAttackerWinner) ||
    (humanNationId === reportData.defenderId && !isAttackerWinner);

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="اتاق توجیه و آنالیز تاکتیکی نبرد (Battle Debrief)"
      subtitle={`گزارش عملیاتی رویارویی ارتش ${attackerName} و ${defenderName}`}
      maxWidthClass="max-w-3xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{attackerFlag}</span>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-foreground block">
                {attackerName}
              </span>
              <span className="text-[10px] text-primary font-mono font-bold">
                فرماندهی مهاجم (
                {reportData.attackType === "NAVAL" ? "دریایی" : "زمینی"})
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-xl bg-military/15 text-military border border-military/30">
              <Swords size={18} />
            </div>
            <span className="text-[9px] font-mono text-muted-foreground font-bold">
              VS
            </span>
          </div>

          <div className="flex items-center gap-3 text-left dir-ltr">
            <span className="text-3xl select-none">{defenderFlag}</span>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-foreground block">
                {defenderName}
              </span>
              <span className="text-[10px] text-military font-mono font-bold">
                دولت مدافع
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, title: "فاز ۱: موشکی و پدافند" },
            { step: 2, title: "فاز ۲: برتری هوایی" },
            { step: 3, title: "فاز ۳: نبرد زرهی و زمین" },
            { step: 4, title: "کارنامه و تلفات نهایی" },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step as 1 | 2 | 3 | 4)}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer truncate ${
                activeStep === item.step
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {activeStep === 1 && (
          <div className="bg-background/50 border border-border/70 p-4.5 rounded-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-treasury" />
                <h4 className="text-xs font-black text-foreground">
                  فاز اول: عملیات ضربت موشکی/پهپادی و پدافند دفاع هوایی
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                  reportData.phase1Missile.phaseWinner === "ATTACKER"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                برتری فاز:{" "}
                {reportData.phase1Missile.phaseWinner === "ATTACKER"
                  ? attackerName
                  : defenderName}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              در آغاز درگیری، مهاجم با پرتاب پرتابه‌های نقطه‌زن تلاش کرد شبکه
              پدافند دشمن را منهدم سازد. پدافند هوایی مدافع نیز اقدام به رهگیری
              و انهدام پهپادها نمود.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground block font-sans">
                  پرتابه‌های مهاجم:
                </span>
                <span className="font-bold text-foreground block">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.dronesLaunched,
                  )}{" "}
                  فروند
                </span>
              </div>
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground block font-sans">
                  پدافند فعال مدافع:
                </span>
                <span className="font-bold text-foreground block">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.defAirDefense,
                  )}{" "}
                  واحد
                </span>
              </div>
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground block font-sans">
                  پهپادهای رهگیری‌شده:
                </span>
                <span className="font-bold text-gdp block">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.dronesIntercepted,
                  )}{" "}
                  فروند
                </span>
              </div>
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground block font-sans">
                  پدافند منهدم‌شده مدافع:
                </span>
                <span className="font-bold text-military block">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase1Missile.airDefenseLost,
                  )}{" "}
                  واحد
                </span>
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="bg-background/50 border border-border/70 p-4.5 rounded-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <Plane size={16} className="text-gdp" />
                <h4 className="text-xs font-black text-foreground">
                  فاز دوم: داگ‌فایت جنگنده‌ها و بمباران مواضع زرهی
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                  reportData.phase2Air.phaseWinner === "ATTACKER"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                برتری هوایی:{" "}
                {reportData.phase2Air.phaseWinner === "ATTACKER"
                  ? attackerName
                  : defenderName}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              اسکادران‌های هوایی دو طرف برای تسخیر آسمان وارد نبرد داگ‌فایت
              شدند. اسکادران‌های آزاد پس از کسب برتری، ستون‌های زرهی و تانک‌های
              دشمن را هدف حملات هوایی سنگین قرار دادند.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground block font-sans">
                  جنگنده‌های مهاجم:
                </span>
                <span className="font-bold text-foreground block">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase2Air.attAirForce,
                  )}{" "}
                  (تلفات:{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase2Air.attAirLost,
                  )}
                  )
                </span>
              </div>
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1">
                <span className="text-[10px] text-muted-foreground block font-sans">
                  جنگنده‌های مدافع:
                </span>
                <span className="font-bold text-foreground block">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase2Air.defAirForce,
                  )}{" "}
                  (تلفات:{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase2Air.defAirLost,
                  )}
                  )
                </span>
              </div>
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1 col-span-2">
                <span className="text-[10px] text-muted-foreground block font-sans">
                  تانک‌های مدافع منهدم‌شده توسط نیروی هوایی مهاجم:
                </span>
                <span className="font-bold text-military block">
                  {PersianNumberFormatter.toPersianDigits(
                    reportData.phase2Air.defArmorDestroyedByAir,
                  )}{" "}
                  واحد زرهی
                </span>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="bg-background/50 border border-border/70 p-4.5 rounded-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-military" />
                <h4 className="text-xs font-black text-foreground">
                  فاز سوم: پیشروی زرهی سنگین و نبرد خطوط پیاده‌نظام
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                  reportData.phase3Ground.phaseWinner === "ATTACKER"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                پیروز خط مقدم:{" "}
                {reportData.phase3Ground.phaseWinner === "ATTACKER"
                  ? attackerName
                  : defenderName}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              لشکرهای زرهی برای شکستن خاکریزها به خطوط پیاده‌نظام یورش بردند و
              در نهایت سربازان پیاده برای تثبیت یا بازپس‌گیری استان هدف با
              یکدیگر درگیر شدند.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1.5">
                <span className="text-[11px] font-bold text-foreground font-sans block">
                  آمار درگیری ارتش {attackerName}:
                </span>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>تانک‌های حاضر (تلفات):</span>
                    <span className="text-foreground font-bold">
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.attArmor,
                      )}{" "}
                      (-
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.attArmorLost,
                      )}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>پیاده‌نظام اعزامی (تلفات):</span>
                    <span className="text-foreground font-bold">
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.attInfantry,
                      )}{" "}
                      (-
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.attInfantryLost,
                      )}
                      )
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-1.5">
                <span className="text-[11px] font-bold text-foreground font-sans block">
                  آمار درگیری ارتش {defenderName}:
                </span>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>تانک‌های مدافع (تلفات):</span>
                    <span className="text-foreground font-bold">
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.defArmor,
                      )}{" "}
                      (-
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.defArmorLost,
                      )}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>پیاده‌نظام مدافع (تلفات):</span>
                    <span className="text-foreground font-bold">
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.defInfantry,
                      )}{" "}
                      (-
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.phase3Ground.defInfantryLost,
                      )}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="bg-background/50 border border-border/70 p-4.5 rounded-2xl space-y-4 animate-in fade-in duration-150">
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isHumanWinner
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/40 text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isHumanWinner ? <Trophy size={20} /> : <Skull size={20} />}
                <div>
                  <span className="text-xs font-black block">
                    نتیجه قطعی: پیروزی {winnerName}{" "}
                    {reportData.isFullCapitulation
                      ? "(تسلیم و الحاق کامل)"
                      : ""}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-sans">
                    نسبت ارزش توان رزمی مهاجم به مدافع:{" "}
                    {PersianNumberFormatter.toPersianDigits(
                      reportData.valuationRatio,
                    )}{" "}
                    به ۱
                  </span>
                </div>
              </div>
              <span className="text-2xl select-none">{winnerFlag}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-2">
                <span className="text-[10px] font-bold text-foreground font-sans block border-b border-border/40 pb-1">
                  کل تلفات قطعی {attackerName}:
                </span>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>پیاده‌نظام از دست‌رفته:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.attackerCasualties.infantryLost,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>تانک و زرهی:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.attackerCasualties.armorLost,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>جنگنده هوایی:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.attackerCasualties.airForceLost,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>پرتابه‌های مصرف‌شده:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.attackerCasualties.droneMissileLost,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-2">
                <span className="text-[10px] font-bold text-foreground font-sans block border-b border-border/40 pb-1">
                  کل تلفات قطعی {defenderName}:
                </span>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>پیاده‌نظام از دست‌رفته:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.defenderCasualties.infantryLost,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>تانک و زرهی:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.defenderCasualties.armorLost,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>پدافند هوایی منهدم‌شده:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.defenderCasualties.airDefenseLost,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>جنگنده هوایی:</span>
                    <span className="text-military font-bold">
                      -
                      {PersianNumberFormatter.toPersianDigits(
                        reportData.defenderCasualties.airForceLost,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {reportData.treasuryLooted > 0 && (
              <div className="p-3 bg-secondary/60 rounded-xl border border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground font-sans flex items-center gap-1.5">
                  <Coins size={14} className="text-gdp" />
                  غنائم خزانه‌داری غارت‌شده:
                </span>
                <span className="font-extrabold text-gdp">
                  +
                  {PersianNumberFormatter.formatCurrency(
                    reportData.treasuryLooted,
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <button
            onClick={() =>
              setActiveStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4)
            }
            disabled={activeStep === 1}
            className="py-2.5 px-4 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ChevronRight size={14} />
            <span>مرحله قبل</span>
          </button>

          <button
            onClick={() => {
              if (activeStep < 4) {
                setActiveStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
              } else {
                onClose();
              }
            }}
            className="py-2.5 px-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>{activeStep === 4 ? "بستن گزارش" : "مرحله بعد"}</span>
            {activeStep < 4 && <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
