import React from "react";
import { TrendingUp } from "lucide-react";

export function MarketHeader() {
  return (
    <div className="space-y-1 dir-rtl text-right">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gdp font-mono uppercase tracking-wider">
        <TrendingUp size={13} />
        <span>بورس بین‌المللی بلوک‌های کلان استراتژیک</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        معامله مستقیم بلوک‌های کلان انرژی و فولاد صنعتی در بازار آزاد جهانی.
        قیمت فروش شفاف معادل ۲/۳ نرخ خرید روز بورس محاسبه می‌گردد.
      </p>
    </div>
  );
}
