import React from "react";
import { ArrowUpCircle, Handshake, Coins, Clock } from "lucide-react";
import { DiplomaticStance, PersianNumberFormatter } from "@geopolitics/domain";

interface DiplomacyStepUpActionsProps {
  currentStance: DiplomaticStance | string;
  strategicPartnershipCost?: number;
  strategicPartnershipDividend?: number;
  canAffordPartnership?: boolean;
  isPeaceCooldownActive?: boolean;
  onPeaceTreaty: () => void;
  onNonAggression: () => void;
  onStrategicPartnership: () => void;
}

export function DiplomacyStepUpActions({
  currentStance,
  strategicPartnershipCost = 0,
  strategicPartnershipDividend = 0,
  canAffordPartnership = true,
  isPeaceCooldownActive = false,
  onPeaceTreaty,
  onNonAggression,
  onStrategicPartnership,
}: DiplomacyStepUpActionsProps) {
  if (currentStance === "WAR") {
    return (
      <button
        onClick={onPeaceTreaty}
        className={`w-full p-3.5 rounded-2xl border text-right transition-all space-y-1 shadow-sm ${
          isPeaceCooldownActive
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 cursor-pointer"
            : "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-400 cursor-pointer"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-1.5">
            {isPeaceCooldownActive ? (
              <Clock size={16} />
            ) : (
              <Handshake size={16} />
            )}
            <span>ورود به میز مذاکرات آتش‌بس و شروط صلح</span>
          </span>
          <ArrowUpCircle
            size={16}
            className={
              isPeaceCooldownActive ? "text-amber-400" : "text-emerald-400"
            }
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {isPeaceCooldownActive
            ? "مخاصمه در نوبت جاری آغاز شده است (امکان تصویب صلح پس از گذر ۱ نوبت فعال می‌شود)."
            : "بررسی زنده تراز قوا، بسته غرامت مالی یا واگذاری ارضی برای پایان جنگ"}
        </p>
      </button>
    );
  }

  if (currentStance === "NORMAL_DIPLOMACY") {
    return (
      <button
        onClick={onNonAggression}
        className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">
            پیشنهاد پیمان عدم تخاصم (گام اول: امنیت مرزی)
          </span>
          <ArrowUpCircle size={16} className="text-emerald-400" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          تثبیت آرامش مرزها و پیش‌نیاز ورود به شراکت استراتژیک
        </p>
      </button>
    );
  }

  if (currentStance === "NON_AGGRESSION_PACT") {
    return (
      <button
        onClick={onStrategicPartnership}
        disabled={!canAffordPartnership}
        className="w-full p-3.5 rounded-2xl bg-gdp/15 hover:bg-gdp/25 disabled:bg-secondary/40 disabled:opacity-60 border border-gdp/40 text-gdp text-right transition-all cursor-pointer space-y-1 shadow-sm font-sans"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-1.5">
            <Coins size={15} />
            <span>انعقاد شراکت استراتژیک (پرداخت ۳٪ GDP کشور مقابل)</span>
          </span>
          <span className="text-[10px] font-mono font-bold bg-gdp/20 px-2 py-0.5 rounded-md text-gdp border border-gdp/30">
            {PersianNumberFormatter.formatCurrency(
              strategicPartnershipCost,
              true,
            )}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          واریز نوبتی{" "}
          <strong className="text-gdp font-mono">
            +
            {PersianNumberFormatter.formatCurrency(
              strategicPartnershipDividend,
              true,
            )}
          </strong>{" "}
          (معادل ۰.۶٪ GDP هدف) به خزانه شما در هر نوبت به همراه انتقال ۰.۶٪ از
          GDP شما به خزانه هدف بدون هیچ‌گونه کسر موجودی.
        </p>
      </button>
    );
  }

  return null;
}
