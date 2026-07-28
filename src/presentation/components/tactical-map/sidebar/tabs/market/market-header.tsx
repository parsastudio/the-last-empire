import React from "react";
import { TrendingUp } from "lucide-react";

export function MarketHeader() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gdp font-mono uppercase tracking-wider">
        <TrendingUp size={13} />
        <span>بورس بین‌المللی کالا و انرژی</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        معامله مستقیم نفت خام و فولاد صنعتی در بازار آزاد جهانی بر اساس نرخ‌های
        زنده عرضه‌وتقاضا.
      </p>
    </div>
  );
}
