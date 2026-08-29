import React from "react";
import { CheckCircle2, Ban, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface BuyProvinceStatusBannersProps {
  ownerNationName: string;
  isOwnCountry: boolean;
  isLastProvince: boolean;
  isLastCoastalProvince: boolean;
  isGeographicallyConnected: boolean;
  canAfford: boolean;
  shortageAmount: number;
}

export function BuyProvinceStatusBanners({
  ownerNationName,
  isOwnCountry,
  isLastProvince,
  isLastCoastalProvince,
  isGeographicallyConnected,
  canAfford,
  shortageAmount,
}: BuyProvinceStatusBannersProps) {
  if (isOwnCountry) {
    return (
      <div className="p-3.5 bg-secondary/60 border border-border/60 rounded-2xl text-xs text-muted-foreground flex items-center gap-2.5">
        <CheckCircle2 size={16} className="text-primary shrink-0" />
        <span>این استان در حال حاضر بخشی از قلمرو قانونی امپراتوری شماست.</span>
      </div>
    );
  }

  if (isLastProvince) {
    return (
      <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 shadow-sm">
        <Ban size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-black block text-amber-400">
            عدم امکان خرید آخرین خاک مادری کشور
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            این استان تنها قلمرو باقی‌مانده کشور {ownerNationName} است. هیچ
            حاکمیتی آخرین پایتخت خود را نمی‌فروشد؛ برای تسخیر این استان باید از
            فرمان تهاجم نظامی استفاده کنید.
          </p>
        </div>
      </div>
    );
  }

  if (isLastCoastalProvince) {
    return (
      <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 shadow-sm">
        <Ban size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-black block text-amber-400">
            عدم امکان خرید آخرین استان ساحلی کشور
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            این استان تنها گذرگاه دریایی و دسترسی کشور {ownerNationName} به
            آب‌های آزاد جهان است. هیچ دولتی آخرین راه ارتباطی خود به اقیانوس را
            واگذار نمی‌کند.
          </p>
        </div>
      </div>
    );
  }

  if (!isGeographicallyConnected) {
    return (
      <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 shadow-sm">
        <Ban size={18} className="text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-black block text-rose-400">
            عدم اتصال جغرافیایی و لجستیکی
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            خرید استان تنها در صورتی مجاز است که خاک هدف با مرزهای فعلی شما
            هم‌مرز زمینی باشد، یا هر دو طرف مستقیماً به آب‌های آزاد دسترسی داشته
            باشند.
          </p>
        </div>
      </div>
    );
  }

  if (!canAfford) {
    return (
      <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl text-xs text-military flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>
            موجودی خزانه ملی برای تأمین قیمت خرید این استان کافی نیست.
          </span>
        </div>
        <span className="font-mono font-bold text-[11px] bg-military/20 px-2 py-0.5 rounded-lg border border-military/30">
          کسری: {PersianNumberFormatter.formatCurrency(shortageAmount, true)}
        </span>
      </div>
    );
  }

  return null;
}
