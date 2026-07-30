import React from "react";
import { Coins } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface EconomyStatsSectionProps {
  gdp: number;
  treasury: number;
  taxRate: number;
  nationalDebt: number;
  tariffRate: number;
}

export function EconomyStatsSection({
  gdp,
  treasury,
  taxRate,
  nationalDebt,
  tariffRate,
}: EconomyStatsSectionProps) {
  const fullTreasury = PersianNumberFormatter.toPersianDigits(
    Math.round(treasury).toLocaleString("en-US"),
  );
  const compactTreasury = PersianNumberFormatter.formatCompactNumber(treasury);

  const formattedGdp = PersianNumberFormatter.formatCurrency(gdp, true);

  const formattedTax = PersianNumberFormatter.toPersianDigits(taxRate);
  const formattedTariff = PersianNumberFormatter.toPersianDigits(tariffRate);
  const formattedDebt = PersianNumberFormatter.toPersianDigits(
    Math.round(nationalDebt).toLocaleString("en-US"),
  );

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Coins size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          وضعیت اقتصادی و مالی
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono">
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans">
            تولید ناخالص (GDP)
          </span>
          <span className="text-xs font-bold text-foreground block">
            {formattedGdp}
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans">
            موجودی خزانه
          </span>
          <span
            className="text-xs font-bold text-gdp block truncate"
            title={`$${fullTreasury} (${compactTreasury})`}
          >
            ${fullTreasury} ({compactTreasury})
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans">
            نرخ مالیات / تعرفه
          </span>
          <span className="text-xs font-bold text-foreground block">
            {formattedTax}٪ / {formattedTariff}٪
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans">
            بدهی ملی
          </span>
          <span className="text-xs font-bold text-military block">
            ${formattedDebt}
          </span>
        </div>
      </div>
    </div>
  );
}
