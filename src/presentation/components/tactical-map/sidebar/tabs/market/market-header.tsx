import React from "react";
import { TrendingUp, Bot } from "lucide-react";

interface MarketHeaderProps {
  onOpenAutoTradeModal?: () => void;
}

export function MarketHeader({ onOpenAutoTradeModal }: MarketHeaderProps) {
  return (
    <div className="space-y-2 dir-rtl text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gdp font-mono uppercase tracking-wider">
          <TrendingUp size={13} />
          <span>بورس بین‌المللی بلوک‌های کلان استراتژیک</span>
        </div>

        {onOpenAutoTradeModal && (
          <button
            onClick={onOpenAutoTradeModal}
            className="px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Bot size={14} />
            <span>تنظیمات بازرگانی خودکار</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        معامله مستقیم بلوک‌های کلان انرژی و فولاد صنعتی در بازار آزاد جهانی. نرخ
        ثابت خرید ۲۵ میلیون دلار و نرخ ثابت فروش ۲۰ میلیون دلار تنظیم گردیده
        است.
      </p>
    </div>
  );
}
