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
  const compactTreasury = PersianNumberFormatter.formatCurrency(treasury, true);
  const formattedGdp = PersianNumberFormatter.formatCurrency(gdp, true);

  const formattedTax = PersianNumberFormatter.toPersianDigits(taxRate);
  const formattedTariff = PersianNumberFormatter.toPersianDigits(tariffRate);
  const formattedDebt = PersianNumberFormatter.toPersianDigits(
    Math.round(nationalDebt).toLocaleString("en-US"),
  );

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Coins size={14} className="text-gdp" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          وضعیت اقتصادی و مالی
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono">
        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold">
            تولید ناخالص (GDP)
          </span>
          <span className="text-xs font-extrabold text-foreground block">
            {formattedGdp}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold">
            موجودی خزانه
          </span>
          <span className="text-xs font-extrabold text-gdp block truncate">
            {compactTreasury}
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold">
            نرخ مالیات / تعرفه
          </span>
          <span className="text-xs font-extrabold text-foreground block">
            {formattedTax}٪ / {formattedTariff}٪
          </span>
        </div>

        <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl space-y-1">
          <span className="text-[9px] text-muted-foreground block font-sans font-bold">
            بدهی ملی
          </span>
          <span className="text-xs font-extrabold text-military block">
            ${formattedDebt}
          </span>
        </div>
      </div>
    </div>
  );
}
