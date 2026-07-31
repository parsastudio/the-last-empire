import React from "react";
import { Swords, Shield, Plane, Radio, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface MilitaryForcesSectionProps {
  infantry: number;
  airForce: number;
  droneMissile: number;
  techLevel: number;
  experience: number;
  militiaGarrisonPower?: number;
}

export function MilitaryForcesSection({
  infantry,
  airForce,
  droneMissile,
  techLevel,
  experience,
  militiaGarrisonPower = 280,
}: MilitaryForcesSectionProps) {
  const techMultiplier = 1 + (techLevel - 1) * 0.2;
  const infantryMoneyUpkeep = Math.floor(infantry * 12 * techMultiplier);
  const airForceMoneyUpkeep = Math.floor(airForce * 36 * techMultiplier);
  const droneMoneyUpkeep = Math.floor(droneMissile * 2.4 * techMultiplier);

  const bonusPercent = (techLevel - 1) * 20;

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Swords size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          قدرت ارتش و تفکیک هزینه نگهداری
        </span>
      </div>

      <div className="space-y-2 font-mono">
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield size={13} className="text-primary shrink-0" />
            <div className="space-y-0.5">
              <span className="text-foreground font-bold block font-sans">
                پیاده‌نظام رزمی
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                نگهداری نوبتی:{" "}
                {PersianNumberFormatter.formatCurrency(infantryMoneyUpkeep)}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              infantry.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert size={13} className="text-treasury shrink-0" />
            <div className="space-y-0.5">
              <span className="text-treasury font-bold block font-sans">
                پادگان و نیروهای انتظامی ملی
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                تامین از نیروهای انتظامی | بدون هزینه مستقیم
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-treasury">
            {PersianNumberFormatter.toPersianDigits(
              militiaGarrisonPower.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Plane size={13} className="text-gdp shrink-0" />
            <div className="space-y-0.5">
              <span className="text-foreground font-bold block font-sans">
                نیروی هوایی و جنگنده
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                نگهداری نوبتی:{" "}
                {PersianNumberFormatter.formatCurrency(airForceMoneyUpkeep)}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              airForce.toLocaleString("en-US"),
            )}{" "}
            فروند
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Radio size={13} className="text-treasury shrink-0" />
            <div className="space-y-0.5">
              <span className="text-foreground font-bold block font-sans">
                پهپاد و تسلیحات موشکی
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                نگهداری نوبتی:{" "}
                {PersianNumberFormatter.formatCurrency(droneMoneyUpkeep)}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              droneMissile.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-sans">
              فناوری نظامی
            </span>
            <span className="text-xs font-bold text-amber-500">
              سطح {PersianNumberFormatter.toPersianDigits(techLevel)}{" "}
              {bonusPercent > 0 && (
                <span className="text-[10px] text-gdp font-mono">
                  (+{PersianNumberFormatter.toPersianDigits(bonusPercent)}٪)
                </span>
              )}
            </span>
          </div>
          <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-sans">
              آمادگی عملیاتی
            </span>
            <span className="text-xs font-bold text-amber-500">
              {PersianNumberFormatter.toPersianDigits(experience)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
