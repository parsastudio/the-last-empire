import React from "react";
import { Rocket, Wallet, CheckCircle2 } from "lucide-react";
import { PersianNumberFormatter } from "@geopolitics/domain";

interface ProjectQuotaHeaderProps {
  treasury: number;
  boostedCountThisTurn: number;
  maxBoostsPerTurn: number;
}

export function ProjectQuotaHeader({
  treasury,
  boostedCountThisTurn,
  maxBoostsPerTurn,
}: ProjectQuotaHeaderProps) {
  const remainingQuota = Math.max(0, maxBoostsPerTurn - boostedCountThisTurn);

  return (
    <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4.5 rounded-3xl flex items-center justify-between gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden font-sans dir-rtl text-right">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <Rocket size={22} className="animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-foreground">
            توسعه و پیشبرد برنامه‌های راهبردی ملی
          </h3>
          <span className="text-[11px] text-muted-foreground block">
            در هر نوبت می‌توانید حداکثر به ۲ پروژه مجزا بودجه پژوهشی (هر گام ۵
            میلیارد دلار) اختصاص دهید.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 font-mono text-xs bg-secondary/80 border border-border/70 px-3.5 py-2 rounded-2xl">
          <Wallet size={14} className="text-gdp" />
          <span className="text-[10px] text-muted-foreground font-sans">
            خزانه ملی:
          </span>
          <span className="font-extrabold text-gdp text-xs">
            {PersianNumberFormatter.formatCurrency(treasury, true)}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 font-mono text-xs border px-3.5 py-2 rounded-2xl shadow-sm ${
            remainingQuota > 0
              ? "bg-primary/15 border-primary/40 text-primary"
              : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
          }`}
        >
          {remainingQuota > 0 ? (
            <Rocket size={14} />
          ) : (
            <CheckCircle2 size={14} />
          )}
          <span className="text-[10px] font-sans font-bold">
            {remainingQuota > 0
              ? `سهمیه نوبت: ${PersianNumberFormatter.toPersianDigits(remainingQuota)} پروژه باقی‌مانده`
              : "تکمیل سهمیه تزریق بودجه این نوبت"}
          </span>
        </div>
      </div>
    </div>
  );
}
