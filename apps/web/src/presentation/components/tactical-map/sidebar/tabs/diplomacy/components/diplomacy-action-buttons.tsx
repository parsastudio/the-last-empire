import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  HeartHandshake,
  ShieldAlert,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { DiplomaticStance } from "@geopolitics/domain";

interface DiplomacyActionButtonsProps {
  currentStance: DiplomaticStance | string;
  foreignAidCost: number;
  postWarCooldownTurns?: number;
  onSendAid: () => void;
  onPeaceTreaty: () => void;
  onNonAggression: () => void;
  onAlliance: () => void;
  onCancelTreaty: () => void;
  onDeclareWar: () => void;
}

export function DiplomacyActionButtons({
  currentStance,
  foreignAidCost,
  postWarCooldownTurns = 0,
  onSendAid,
  onPeaceTreaty,
  onNonAggression,
  onAlliance,
  onCancelTreaty,
  onDeclareWar,
}: DiplomacyActionButtonsProps) {
  const isCooldownActive = postWarCooldownTurns > 0;

  const renderStepUpAction = () => {
    if (currentStance === "WAR") {
      return (
        <button
          onClick={onPeaceTreaty}
          className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black">
              ارسال معاهده صلح و آتش‌بس (گام رو به بالا: دیپلماسی عادی)
            </span>
            <ArrowUpCircle size={16} className="text-emerald-400" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            پیشنهاد پایان جنگ و بازگشت به روابط عادی بین‌المللی
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
              پیشنهاد پیمان عدم تخاصم (گام رو به بالا: امنیت مرزی)
            </span>
            <ArrowUpCircle size={16} className="text-emerald-400" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            تثبیت آرامش مرزها و ارتقای سطح روابط سیاسی
          </p>
        </button>
      );
    }

    if (currentStance === "NON_AGGRESSION_PACT") {
      return (
        <button
          onClick={onAlliance}
          className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black">
              پیشنهاد معاهده اتحاد کامل (گام رو به بالا: بالاترین سطح)
            </span>
            <ArrowUpCircle size={16} className="text-emerald-400" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            پیمان دفاع جمعی نظامی و همکاری راهبردی همه‌جانبه
          </p>
        </button>
      );
    }

    return null;
  };

  const renderStepDownAction = () => {
    if (currentStance === "WAR") {
      return null;
    }

    if (currentStance === "NORMAL_DIPLOMACY") {
      return (
        <button
          onClick={onDeclareWar}
          disabled={isCooldownActive}
          className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 disabled:bg-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30 text-rose-400 disabled:text-muted-foreground text-right transition-all cursor-pointer space-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold">
              {isCooldownActive
                ? `سردسازی پس از جنگ (${PersianNumberFormatter.toPersianDigits(postWarCooldownTurns)} نوبت تا امکان اعلان جنگ)`
                : "اعلان جنگ رسمی (گام رو به پایین: قطع روابط و نبرد)"}
            </span>
            <ArrowDownCircle size={15} />
          </div>
        </button>
      );
    }

    if (currentStance === "NON_AGGRESSION_PACT") {
      return (
        <div className="space-y-2">
          <button
            onClick={onCancelTreaty}
            className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                لغو پیمان عدم تخاصم (گام رو به پایین: دیپلماسی عادی)
              </span>
              <ArrowDownCircle size={15} className="text-amber-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              تنزل آرام و قانونی سطح روابط بدون اعلام جنگ
            </p>
          </button>

          <button
            onClick={onDeclareWar}
            disabled={isCooldownActive}
            className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 disabled:bg-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30 text-rose-400 disabled:text-muted-foreground text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                {isCooldownActive
                  ? `سردسازی پس از جنگ (${PersianNumberFormatter.toPersianDigits(postWarCooldownTurns)} نوبت تا امکان اعلان جنگ)`
                  : "لغو تعهد و اعلان جنگ مستقیم (با جریمه نقض پیمان)"}
              </span>
              <ShieldAlert size={15} />
            </div>
          </button>
        </div>
      );
    }

    if (currentStance === "ALLIANCE") {
      return (
        <div className="space-y-2">
          <button
            onClick={onCancelTreaty}
            className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                لغو معاهده اتحاد (گام رو به پایین: پیمان عدم تخاصم)
              </span>
              <ArrowDownCircle size={15} className="text-amber-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              خروج از اتحاد نظامی و بازگشت به توافق عدم تعرض
            </p>
          </button>

          <button
            onClick={onDeclareWar}
            disabled={isCooldownActive}
            className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 disabled:bg-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30 text-rose-400 disabled:text-muted-foreground text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                {isCooldownActive
                  ? `سردسازی پس از جنگ (${PersianNumberFormatter.toPersianDigits(postWarCooldownTurns)} نوبت تا امکان اعلان جنگ)`
                  : "پیمان‌شکنی و اعلان جنگ مستقیم (با جریمه سنگین اعتبار)"}
              </span>
              <ShieldAlert size={15} />
            </div>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-2.5 font-sans">
      {renderStepUpAction()}

      {currentStance !== "WAR" && (
        <button
          onClick={onSendAid}
          className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500">
              ارسال کمک مالی و دیپلماتیک (
              {PersianNumberFormatter.formatCurrency(foreignAidCost)})
            </span>
            <HeartHandshake size={14} className="text-amber-500" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            بهبود فوری ۲۵+ همسویی و تسهیل پذیرش گام‌های ارتقای روابط
          </p>
        </button>
      )}

      {renderStepDownAction()}
    </div>
  );
}
