import React from "react";
import { Award, ChevronLeft, ShieldCheck } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface AlliedSellerItem {
  id: string;
  name: string;
  flagCode: string;
  techLevel: number;
  rank: number;
  alignment: number;
}

interface AlliedSellerCardProps {
  seller: AlliedSellerItem;
  onSelect: (id: string) => void;
}

export function AlliedSellerCard({ seller, onSelect }: AlliedSellerCardProps) {
  const flag = getFlagEmoji(seller.flagCode || seller.id);

  return (
    <button
      type="button"
      onClick={() => onSelect(seller.id)}
      className="w-full bg-background/50 hover:bg-secondary/60 border border-border/80 hover:border-primary/50 p-4 rounded-2xl flex items-center justify-between gap-3 text-right transition-all cursor-pointer group shadow-sm"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-secondary/80 border border-border/70 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
          {flag}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black text-foreground">
              {seller.name}
            </h4>
            <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Award size={10} />
              رتبه #{PersianNumberFormatter.toPersianDigits(seller.rank)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span>
              فناوری نظامی: سطح{" "}
              {PersianNumberFormatter.toPersianDigits(seller.techLevel)}
            </span>
            <span>•</span>
            <span className="text-gdp">
              همسویی: +
              {PersianNumberFormatter.toPersianDigits(seller.alignment)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
          <ShieldCheck size={12} />
          ورود به تسلیحات
        </span>
        <ChevronLeft
          size={16}
          className="text-muted-foreground group-hover:text-foreground group-hover:-translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}
