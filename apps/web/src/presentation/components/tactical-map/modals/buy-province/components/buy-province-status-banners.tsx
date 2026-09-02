import React from "react";
import {
  CheckCircle2,
  Ban,
  ShieldAlert,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ProvinceTradeValidationResult } from "@geopolitics/domain";

interface BuyProvinceStatusBannersProps {
  validation: ProvinceTradeValidationResult | null;
  ownerNationName: string;
}

export function BuyProvinceStatusBanners({
  validation,
  ownerNationName,
}: BuyProvinceStatusBannersProps) {
  if (!validation) return null;

  if (validation.isOwnCountry) {
    return (
      <div className="p-3.5 bg-secondary/60 border border-border/80 rounded-2xl text-xs text-muted-foreground flex items-center gap-2.5">
        <CheckCircle2 size={16} className="text-primary shrink-0" />
        <span>این استان در حال حاضر در تملک قانونی امپراتوری شماست.</span>
      </div>
    );
  }

  if (validation.isAtWar) {
    return (
      <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 shadow-sm">
        <Ban size={18} className="text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-black block text-rose-400">
            وضعیت جنگی فعال با کشور فروشنده
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            کشور {ownerNationName} به دلیل درگیری در جنگ متخاصم با شما، حاضر به
            مذاکره بر سر واگذاری استان نیست. برای تصرف استان باید از تهاجم نظامی
            استفاده کنید.
          </p>
        </div>
      </div>
    );
  }

  if (validation.hasBoughtThisTurn) {
    return (
      <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 shadow-sm">
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-black block text-amber-400">
            تکمیل سهمیه الحاق سرزمینی در این نوبت
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            امپراتوری شما در این نوبت یک استان خریداری کرده است. به دلیل قوانین
            دیپلماتیک و ثبات ارضی، در هر نوبت حداکثر ۱ استان قابل خرید است. خرید
            استان بعدی در نوبت بعد امکان‌پذیر خواهد بود.
          </p>
        </div>
      </div>
    );
  }

  if (validation.isHigherRankSeller) {
    return (
      <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 shadow-sm">
        <Layers size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-black block text-amber-400">
            امتناع قدرت برتر از واگذاری خاک به کشور ضعیف‌تر
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            کشور {ownerNationName} (رتبه #
            {PersianNumberFormatter.toPersianDigits(validation.sellerRank)})
            دارای رتبه و سطح قدرت بالاتری از کشور شما (رتبه #
            {PersianNumberFormatter.toPersianDigits(validation.buyerRank)}) است.
            ابرقدرت‌ها و کشورهای با لول بالاتر هرگز خاک خود را به کشورهای با لول
            پایین‌تر نمی‌فروشند.
          </p>
        </div>
      </div>
    );
  }

  if (validation.isLastProvince) {
    return (
      <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 shadow-sm">
        <Ban size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-black block text-amber-400">
            ممنوعیت خرید آخرین خاک مادری کشور فروشنده
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            این استان تنها قلمرو حاکمیتی باقی‌مانده کشور {ownerNationName} است.
            هیچ دولتی پایتخت نهایی خود را واگذار نمی‌کند؛ برای تصرف آن باید از
            تهاجم نظامی استفاده کنید.
          </p>
        </div>
      </div>
    );
  }

  if (validation.isLastCoastalProvince) {
    return (
      <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 shadow-sm">
        <Ban size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-black block text-amber-400">
            ممنوعیت واگذاری آخرین گذرگاه دریایی
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            این استان تنها دسترسی کشور {ownerNationName} به آب‌های آزاد است و
            حاضر به مصالحه بر سر آن نیست.
          </p>
        </div>
      </div>
    );
  }

  if (!validation.isGeographicallyConnected) {
    return (
      <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 shadow-sm">
        <Ban size={18} className="text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-black block text-rose-400">
            عدم اتصال مرزی و پیوستگی سرزمینی
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            الحاق استان تنها در صورتی مجاز است که خاک هدف با مرزهای فعلی شما
            هم‌مرز زمینی باشد یا هر دو کشور مستقیماً به آب‌های آزاد دسترسی داشته
            باشند.
          </p>
        </div>
      </div>
    );
  }

  if (!validation.canAfford) {
    return (
      <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl text-xs text-military flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>
            موجودی خزانه ملی برای تأمین قیمت خرید این استان کافی نیست.
          </span>
        </div>
        <span className="font-mono font-bold text-[11px] bg-military/20 px-2 py-0.5 rounded-lg border border-military/30">
          کسری:{" "}
          {PersianNumberFormatter.formatCurrency(
            validation.shortageAmount,
            true,
          )}
        </span>
      </div>
    );
  }

  return null;
}
