import React from "react";
import { AlertTriangle, ShieldAlert, Radio, Flame } from "lucide-react";
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
}

export function AttackStatusAlerts({
  isLandNeighbor,
  isNavalValid = false,
  isWarStance,
  currentStance,
  reputationPenalty,
  targetNationName,
  targetRegionName,
}: AttackStatusAlertsProps) {
  const isAccessible = isLandNeighbor || isNavalValid;
  const formattedRegionName = ProvinceNameFormatter.format(targetRegionName);

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
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
