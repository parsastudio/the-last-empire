import React from "react";
import { LucideIcon } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface CommodityCardProps {
  title: string;
  unit: string;
  icon: LucideIcon;
  colorClass: string;
  stock: number;
  currentPrice: number;
  priceTrend: "up" | "down" | "stable";
  onTrade: (action: "buy" | "sell") => void;
}

export function CommodityCard({
  title,
  unit,
  icon: Icon,
  colorClass,
  stock,
  currentPrice,
  onTrade,
}: CommodityCardProps) {
  const isOil = title.includes("نفت");
  const subLabel = isOil ? "(هر بلوک = ۱۰M بشکه)" : "(هر بلوک = ۱M تن)";
  const buyPrice = currentPrice || 25000000;
  const sellPrice = 20000000;

  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={colorClass} />
          <div>
            <span className="text-xs font-bold text-foreground block">
              {title}
            </span>
            <span className="text-[9px] text-muted-foreground font-mono block">
              {subLabel}
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md font-bold bg-secondary text-muted-foreground">
          ● نرخ ثابت
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
          <span className="text-[9px] text-muted-foreground block font-sans">
            ذخیره انبار ملی
          </span>
          <span className="font-bold text-foreground block">
            {PersianNumberFormatter.toPersianDigits(
              stock.toLocaleString("en-US"),
            )}{" "}
            {unit}
          </span>
        </div>

        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
          <span className="text-[9px] text-muted-foreground block font-sans">
            خرید ۲۵M / فروش ۲۰M
          </span>
          <span className="font-bold text-gdp block text-[11px]">
            {PersianNumberFormatter.formatCurrency(buyPrice, true)} /{" "}
            {PersianNumberFormatter.formatCurrency(sellPrice, true)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onTrade("buy")}
          className="py-2 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm"
        >
          خرید به نرخ ۲۵M
        </button>
        <button
          onClick={() => onTrade("sell")}
          className="py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl text-[10px] font-bold transition-all cursor-pointer"
        >
          فروش به نرخ ۲۰M
        </button>
      </div>
    </div>
  );
}
