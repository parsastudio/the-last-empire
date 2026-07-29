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
  const infantryMoneyUpkeep = Math.floor(infantry * 12 * techLevel);
  const airForceMoneyUpkeep = Math.floor(airForce * 36 * techLevel);
  const airForceOilUpkeep = Math.ceil(airForce * 0.5);
  const droneMoneyUpkeep = Math.floor(droneMissile * 2.4 * techLevel);
  const droneOilUpkeep = Math.ceil(droneMissile * 0.5);

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
                نگهداری: $
                {PersianNumberFormatter.toPersianDigits(
                  infantryMoneyUpkeep.toLocaleString("en-US"),
                )}{" "}
                | بدون مصرف سوخت
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
                پادگان و میلیشیای وطن
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                تامین از دفاع مردمی | بدون هزینه خزانه
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
                نگهداری: $
                {PersianNumberFormatter.toPersianDigits(
                  airForceMoneyUpkeep.toLocaleString("en-US"),
                )}{" "}
                |{" "}
                {PersianNumberFormatter.toPersianDigits(
                  airForceOilUpkeep.toLocaleString("en-US"),
                )}{" "}
                بشکه نفت/نوبت
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
                نگهداری: $
                {PersianNumberFormatter.toPersianDigits(
                  droneMoneyUpkeep.toLocaleString("en-US"),
                )}{" "}
                |{" "}
                {PersianNumberFormatter.toPersianDigits(
                  droneOilUpkeep.toLocaleString("en-US"),
                )}{" "}
                بشکه نفت/نوبت
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
            <span className="text-xs font-bold text-foreground">
              لِوِل {PersianNumberFormatter.toPersianDigits(techLevel)}
            </span>
          </div>
          <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-sans">
              تجربه جنگی
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
