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
    <div className="bg-card/95 border border-border/80 p-4.5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-2xl font-sans dir-rtl text-right">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <Rocket size={20} className="animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm md:text-base font-black text-foreground">
            پژوهش‌ها و برنامه‌های راهبردی ملی
          </h3>
          <span className="text-xs text-muted-foreground block font-sans">
            سرمایه‌گذاری گام‌به‌گام در فناوری‌های کشور (هر گام ۵ میلیارد دلار)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 font-mono text-xs flex-wrap">
        <div className="flex items-center gap-2 bg-secondary/80 border border-border/70 px-4 py-2 rounded-2xl">
          <Wallet size={15} className="text-gdp" />
          <span className="text-xs text-muted-foreground font-sans font-bold">
            خزانه:
          </span>
          <span className="font-black text-gdp text-sm font-mono">
            {PersianNumberFormatter.formatCurrency(treasury, true)}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-sans text-xs shadow-sm ${
            remainingQuota > 0
              ? "bg-primary/15 border-primary/40 text-primary font-bold"
              : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold"
          }`}
        >
          {remainingQuota > 0 ? (
            <Rocket size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          <span className="text-xs font-extrabold">
            {remainingQuota > 0
              ? `سهمیه این نوبت: ${PersianNumberFormatter.toPersianDigits(remainingQuota)} از ${PersianNumberFormatter.toPersianDigits(maxBoostsPerTurn)}`
              : "تکمیل سهمیه این نوبت"}
          </span>
        </div>
      </div>
    </div>
  );
}
