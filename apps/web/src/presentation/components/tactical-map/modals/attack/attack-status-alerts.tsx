import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Radio,
  Flame,
  Swords,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ProvinceNameFormatter } from "@/presentation/utils/province-name-formatter";
import { getDiplomaticStanceLabel } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-appearance.utility";

interface AttackStatusAlertsProps {
  isLandNeighbor: boolean;
  isNavalValid?: boolean;
  isWarStance: boolean;
  currentStance: DiplomaticStance;
  reputationPenalty: number;
  targetNationName: string;
  targetRegionName: string;
  hasAlreadyAttackedThisTurn?: boolean;
  activeGuarantorNames?: string[];
  mutualGuarantorNames?: string[];
  partnerGuarantorNames?: string[];
}

export function AttackStatusAlerts({
  isLandNeighbor,
  isNavalValid = false,
  isWarStance,
  currentStance,
  reputationPenalty,
  targetNationName,
  targetRegionName,
  hasAlreadyAttackedThisTurn = false,
  activeGuarantorNames = [],
  mutualGuarantorNames = [],
  partnerGuarantorNames = [],
}: AttackStatusAlertsProps) {
  const isAccessible = isLandNeighbor || isNavalValid;
  const formattedRegionName = ProvinceNameFormatter.format(targetRegionName);

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      {hasAlreadyAttackedThisTurn && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl flex items-start gap-3 text-xs text-amber-300 font-sans shadow-lg shadow-amber-500/10 animate-fade-smooth">
          <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-sm block text-amber-400">
              سقف عملیات در نوبت جاری تکمیل است
            </span>
            <p className="text-[11px] leading-relaxed text-foreground/90">
              شما در این دست قبلاً به مواضع {targetNationName} تهاجم نظامی
              کرده‌اید. در هر نوبت حداکثر ۱ بار امکان صدور فرمان حمله به یک کشور
              وجود دارد؛ برای تهاجم مجدد نوبت را به پایان برسانید.
            </p>
          </div>
        </div>
      )}

      {!isAccessible && (
        <div className="p-4 bg-military/15 border border-military/50 rounded-2xl flex items-start gap-3 text-xs text-military font-sans shadow-lg shadow-military/10 animate-fade-smooth">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-sm block">
              مسدود بودن مسیر دسترسی زمینی و دریایی
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              هیچ مرز زمینی مشترک یا دسترسی به آب‌های آزاد برای اجرای عملیات
              دریایی به {formattedRegionName} وجود ندارد.
            </p>
          </div>
        </div>
      )}

      {isAccessible && activeGuarantorNames.length > 0 && (
        <div className="p-4 bg-rose-950/40 border-2 border-rose-500/60 rounded-2xl space-y-2 shadow-lg animate-fade-smooth">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <Swords size={18} className="animate-pulse shrink-0" />
              <span className="text-xs font-black">
                هشدار ورود ضامن به جنگ: {activeGuarantorNames.join(" و ")}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-lg">
              اعلان جنگ قطعی
            </span>
          </div>
          <p className="text-[11px] text-foreground/90 leading-relaxed font-medium">
            کشور {targetNationName} دارای پیمان دفاع سرزمینی با امپراتوری{" "}
            <strong className="text-rose-400">
              {activeGuarantorNames.join(" و ")}
            </strong>{" "}
            است. در صورت تهاجم، ارتش این کشورها رسماً و بلافاصله به شما اعلان
            جنگ داده و جبهه نبرد جدیدی باز خواهند کرد.
          </p>
        </div>
      )}

      {isAccessible && mutualGuarantorNames.length > 0 && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-2xl space-y-1.5 text-xs text-amber-300 animate-fade-smooth">
          <div className="flex items-center gap-2 font-black text-amber-400">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              تضاد منافع حامی مشترک ({mutualGuarantorNames.join(" و ")})
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            کشور {mutualGuarantorNames.join(" و ")} ضامن دفاعی همزمان شما و کشور
            هدف است. در صورت تهاجم، پیمان دفاعی هر دو کشور لغو شده و آن کشور
            اعلام بی‌طرفی می‌کند.
          </p>
        </div>
      )}

      {isAccessible && partnerGuarantorNames.length > 0 && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-1.5 text-xs text-emerald-300 animate-fade-smooth">
          <div className="flex items-center gap-2 font-black text-emerald-400">
            <ShieldCheck size={16} className="shrink-0" />
            <span>
              پایبندی به شراکت استراتژیک با شما (
              {partnerGuarantorNames.join(" و ")})
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            کشور {partnerGuarantorNames.join(" و ")} با شما شراکت استراتژیک
            اقتصادی دارد؛ لذا در صورت تهاجم به این هدف، علیه شما وارد جنگ نخواهد
            شد.
          </p>
        </div>
      )}

      {isAccessible && !isWarStance && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/60 via-card to-amber-950/40 border-2 border-amber-500/60 p-4 rounded-2xl shadow-xl shadow-amber-500/10 space-y-2.5 animate-fade-smooth">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle size={18} className="animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-400 block">
                  هشدار امنیتی: تهاجم غافلگیرانه بدون اعلان جنگ رسمی
                </span>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  وضعیت فعلی روابط: {getDiplomaticStanceLabel(currentStance)}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1 shrink-0 animate-pulse">
              <Radio size={12} className="animate-ping text-amber-400" />
              کاهش {PersianNumberFormatter.toPersianDigits(
                reputationPenalty,
              )}{" "}
              امتیاز اعتبار
            </span>
          </div>

          <div className="bg-background/80 border border-amber-500/30 p-2.5 rounded-xl text-[11px] leading-relaxed text-foreground/90 font-medium flex items-center gap-2 shadow-inner">
            <Flame size={15} className="text-amber-400 shrink-0" />
            <span>
              حمله مستقیم به خاک {targetNationName} بدون صدور بیانیه قبلی، نقض
              معاهدات بین‌المللی تلقی شده و موجب کسر{" "}
              <strong className="text-amber-400 font-black font-mono">
                {PersianNumberFormatter.toPersianDigits(reputationPenalty)}
              </strong>{" "}
              امتیاز از پرستیژ و جایگاه جهانی کشور شما خواهد شد.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
