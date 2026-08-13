import React from "react";
import {
  Swords,
  Shield,
  ShieldAlert,
  Plane,
  Radio,
  Anchor,
  Crosshair,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { Nation } from "@/domain/nation/nation.schema";
import { DEFAULT_NATION_MOCK } from "@/domain/nation/default-nation.mock";

interface MilitaryForcesSectionProps {
  infantry: number;
  armor?: number;
  airDefense?: number;
  airForce: number;
  droneMissile: number;
  navalFleet?: number;
  techLevel: number;
  experience: number;
  nation?: Nation;
}

export function MilitaryForcesSection({
  infantry,
  armor = 0,
  airDefense = 0,
  airForce,
  droneMissile,
  navalFleet = 0,
  techLevel,
  experience,
  nation,
}: MilitaryForcesSectionProps) {
  const activeNation: Nation = nation || {
    ...DEFAULT_NATION_MOCK,
    military: {
      infantry,
      armor,
      airDefense,
      airForce,
      droneMissile,
      navalFleet,
      experience,
      techLevel,
    },
  };

  const payroll = MilitaryPayrollCalculator.calculatePayroll(activeNation);
  const bonusPercent = (techLevel - 1) * 20;

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Swords size={14} className="text-military" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          قدرت ارتش و حقوق و پشتیبانی نوبتی یگان‌ها
        </span>
      </div>

      <div className="space-y-2.5 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Shield size={14} className="text-primary shrink-0" />
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block font-sans">
                  پیاده‌نظام
                </span>
                <span className="text-[9px] text-muted-foreground block font-sans">
                  {PersianNumberFormatter.formatCurrency(payroll.infantry)}
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(
                infantry.toLocaleString("en-US"),
              )}
            </span>
          </div>

          <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <ShieldAlert size={14} className="text-military shrink-0" />
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block font-sans">
                  زرهی و تانک
                </span>
                <span className="text-[9px] text-muted-foreground block font-sans">
                  {PersianNumberFormatter.formatCurrency(payroll.armor)}
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(
                armor.toLocaleString("en-US"),
              )}
            </span>
          </div>

          <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Crosshair size={14} className="text-diplomacy shrink-0" />
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block font-sans">
                  پدافند هوایی
                </span>
                <span className="text-[9px] text-muted-foreground block font-sans">
                  {PersianNumberFormatter.formatCurrency(payroll.airDefense)}
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(
                airDefense.toLocaleString("en-US"),
              )}
            </span>
          </div>

          <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Plane size={14} className="text-gdp shrink-0" />
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block font-sans">
                  نیروی هوایی
                </span>
                <span className="text-[9px] text-muted-foreground block font-sans">
                  {PersianNumberFormatter.formatCurrency(payroll.airForce)}
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(
                airForce.toLocaleString("en-US"),
              )}
            </span>
          </div>

          <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Radio size={14} className="text-treasury shrink-0" />
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block font-sans">
                  پهپاد و موشک
                </span>
                <span className="text-[9px] text-muted-foreground block font-sans">
                  {PersianNumberFormatter.formatCurrency(payroll.droneMissile)}
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(
                droneMissile.toLocaleString("en-US"),
              )}
            </span>
          </div>

          <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Anchor size={14} className="text-primary shrink-0" />
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block font-sans">
                  ناوگان دریایی
                </span>
                <span className="text-[9px] text-muted-foreground block font-sans">
                  {PersianNumberFormatter.formatCurrency(payroll.navalFleet)}
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(
                navalFleet.toLocaleString("en-US"),
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-background/50 border border-border/70 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-sans font-bold">
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
          <div className="bg-background/50 border border-border/70 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-sans font-bold">
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
