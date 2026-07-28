import React from "react";
import { Swords, Shield, Plane, Radio, ShieldAlert } from "lucide-react";

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
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Swords size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          قدرت ارتش و تسلیحات
        </span>
      </div>

      <div className="space-y-2 font-mono">
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield size={13} className="text-primary" />
            <span>پیاده‌نظام رزمی</span>
          </div>
          <span className="text-xs font-bold text-foreground">
            {infantry.toLocaleString("fa-IR")} یگان
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert size={13} className="text-treasury" />
            <span>پادگان و میلیشیای وطن</span>
          </div>
          <span className="text-xs font-bold text-treasury">
            {militiaGarrisonPower.toLocaleString("fa-IR")} یگان
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Plane size={13} className="text-gdp" />
            <span>نیروی هوایی و جنگنده</span>
          </div>
          <span className="text-xs font-bold text-foreground">
            {airForce.toLocaleString("fa-IR")} فروند
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Radio size={13} className="text-treasury" />
            <span>پهپاد و تسلیحات موشکی</span>
          </div>
          <span className="text-xs font-bold text-foreground">
            {droneMissile.toLocaleString("fa-IR")} یگان
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              فناوری نظامی
            </span>
            <span className="text-xs font-bold text-foreground">
              لِوِل {techLevel}
            </span>
          </div>
          <div className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              تجربه جنگی
            </span>
            <span className="text-xs font-bold text-amber-500">
              {experience}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
