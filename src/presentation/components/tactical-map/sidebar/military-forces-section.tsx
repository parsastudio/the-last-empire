import React from "react";
import { Swords, Shield, Plane, Radio, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { Nation } from "@/domain/nation/nation.schema";

interface MilitaryForcesSectionProps {
  infantry: number;
  airForce: number;
  droneMissile: number;
  techLevel: number;
  experience: number;
  militiaGarrisonPower?: number;
  nation?: Nation;
}

export function MilitaryForcesSection({
  infantry,
  airForce,
  droneMissile,
  techLevel,
  experience,
  militiaGarrisonPower = 280,
  nation,
}: MilitaryForcesSectionProps) {
  const activeNation: Nation = nation ?? {
    id: "NATION_DEFAULT",
    name: "ملی",
    isAi: false,
    isAlive: true,
    flagCode: "IR",
    rank: 1,
    gdp: 0,
    taxRate: 0,
    tariffRate: 0,
    treasury: 0,
    nationalDebt: 0,
    population: 0,
    industrialLevel: 1,
    consecutiveDeficitTurns: 0,
    government: {
      type: "DEMOCRACY",
      stability: 80,
      corruption: 0,
      turnsInPower: 1,
    },
    resources: { oil: 0, manpower: 0 },
    military: { infantry, airForce, droneMissile, experience, techLevel },
    recruitmentQueue: [],
    geography: {
      landNeighbors: [],
      seaNeighbors: [],
      hasSeaAccess: true,
      territoryPixelCount: 0,
      infrastructureLevel: 1,
      contiguousMainlandPixelCount: 0,
      isolatedPockets: [],
      coordinates: [],
    },
    relations: {},
    activeModifiers: [],
    traits: [],
    globalReputation: 50,
    doctrines: { doctrinePoints: 0, unlockedDoctrines: [] },
    researchBudgetRate: 0,
    accumulatedResearchCost: 0,
    researchCycleTurn: 0,
    proxyInfluenceBudget: {},
    autoTradeSettings: {
      autoBuyDeficit: false,
      autoSellOilPercent: 0,
      allowEmergencyLoans: true,
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
        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Shield size={14} className="text-primary shrink-0" />
            <div className="space-y-0.5">
              <span className="text-foreground font-bold block font-sans">
                پیاده‌نظام رزمی
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                حقوق نوبتی:{" "}
                {PersianNumberFormatter.formatCurrency(payroll.infantry)}
              </span>
            </div>
          </div>
          <span className="text-xs font-extrabold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              infantry.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <ShieldAlert size={14} className="text-treasury shrink-0" />
            <div className="space-y-0.5">
              <span className="text-treasury font-bold block font-sans">
                پادگان و نیروهای انتظامی ملی
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                تامین از نیروهای انتظامی | بدون هزینه مستقیم
              </span>
            </div>
          </div>
          <span className="text-xs font-extrabold text-treasury">
            {PersianNumberFormatter.toPersianDigits(
              militiaGarrisonPower.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Plane size={14} className="text-gdp shrink-0" />
            <div className="space-y-0.5">
              <span className="text-foreground font-bold block font-sans">
                نیروی هوایی و جنگنده
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                حقوق نوبتی:{" "}
                {PersianNumberFormatter.formatCurrency(payroll.airForce)}
              </span>
            </div>
          </div>
          <span className="text-xs font-extrabold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              airForce.toLocaleString("en-US"),
            )}{" "}
            فروند
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Radio size={14} className="text-treasury shrink-0" />
            <div className="space-y-0.5">
              <span className="text-foreground font-bold block font-sans">
                پهپاد و تسلیحات موشکی
              </span>
              <span className="text-[9px] text-muted-foreground block font-sans">
                حقوق نوبتی:{" "}
                {PersianNumberFormatter.formatCurrency(payroll.droneMissile)}
              </span>
            </div>
          </div>
          <span className="text-xs font-extrabold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              droneMissile.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
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
