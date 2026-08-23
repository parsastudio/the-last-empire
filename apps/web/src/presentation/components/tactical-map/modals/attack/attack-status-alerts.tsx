import React from "react";
import { Anchor, ShieldAlert, AlertTriangle } from "lucide-react";

interface AttackStatusAlertsProps {
  isLandNeighbor: boolean;
  isNavalValid: boolean;
  navalOriginProvince: string;
  isWarStance: boolean;
  targetRegionName: string;
}

export function AttackStatusAlerts({
  isLandNeighbor,
  isNavalValid,
  navalOriginProvince,
  isWarStance,
  targetRegionName,
}: AttackStatusAlertsProps) {
  const formattedRegionName = targetRegionName.startsWith("استان")
    ? targetRegionName
    : `استان ${targetRegionName}`;

  return (
    <div className="space-y-2.5 dir-rtl text-right font-sans">
      {!isLandNeighbor && isNavalValid && (
        <div className="p-3 bg-secondary/40 border border-border/60 rounded-2xl flex items-center justify-between text-xs font-sans">
          <span className="flex items-center gap-1.5 text-gdp font-bold">
            <Anchor size={14} />
            عملیات هجوم آبی-خاکی از طریق آب‌های آزاد
          </span>
          <span className="text-[10px] font-mono text-muted-foreground bg-background/80 px-2.5 py-1 rounded-xl border border-border/40">
            مبدا ترابری: {navalOriginProvince}
          </span>
        </div>
      )}

      {!isLandNeighbor && !isNavalValid && (
        <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl flex items-start gap-2.5 text-xs text-military font-sans">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              مسدود بودن مسیر دسترسی زمینی و دریایی
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              هیچ استان ساحلی یا مرز زمینی مستقیمی برای اعزام یگان‌ها به{" "}
              {formattedRegionName} در دسترس نیست.
            </p>
          </div>
        </div>
      )}

      {isLandNeighbor && !isWarStance && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-amber-500 font-sans">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              حمله غافلگیرانه بدون اعلان جنگ رسمی
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              تهاجم بدون صدور بیانیه قبلی باعث کسر ۱۵ امتیاز اعتبار بین‌المللی
              خواهد شد.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
