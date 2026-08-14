import React from "react";
import { Search, ShoppingCart, ShieldCheck, AlertTriangle } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ArmsSellerOption } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-arms-market-form";

interface ArmsExporterListProps {
  sellerOptions: ArmsSellerOption[];
  selectedSellerId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSeller: (id: string) => void;
}

export function ArmsExporterList({
  sellerOptions,
  selectedSellerId,
  searchQuery,
  onSearchChange,
  onSelectSeller,
}: ArmsExporterListProps) {
  return (
    <div className="space-y-3 bg-background/30 p-4 border border-border/60 rounded-3xl">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-gdp" />
          <span className="text-xs font-bold text-foreground">
            صادرکنندگان فعال تسلیحات
          </span>
        </div>
        <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground">
          {PersianNumberFormatter.toPersianDigits(sellerOptions.length)} کشور
        </span>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="جستجوی نام یا نماد صادرکننده..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right"
        />
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {sellerOptions.length === 0 ? (
          <div className="p-4 bg-secondary/40 border border-amber-500/30 rounded-2xl text-center space-y-2.5">
            <AlertTriangle size={24} className="mx-auto text-amber-500" />
            <h4 className="text-xs font-bold text-foreground font-sans">
              هیچ کشور صادرکننده‌ای در دسترس نیست
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
              برای خرید جنگ‌افزارهای پیشرفته خارجی، دیدگاه دیپلماتیک دوجانبه با
              صادرکننده باید حداقل به مثبت ۲۰ (+۲۰) برسد.
            </p>
          </div>
        ) : (
          sellerOptions.map((seller) => {
            const isSelected = seller.id === selectedSellerId;
            const flag = getFlagEmoji(seller.flagCode);

            return (
              <button
                key={seller.id}
                onClick={() => onSelectSeller(seller.id)}
                className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                  isSelected
                    ? "bg-secondary border-primary font-bold shadow-sm"
                    : "bg-background/40 border-border/60 hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-xl select-none"
                    role="img"
                    aria-label={seller.name}
                  >
                    {flag}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="block font-bold">{seller.name}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">
                        #{PersianNumberFormatter.toPersianDigits(seller.rank)}
                      </span>
                    </div>
                    <span className="text-[9px] text-amber-500 font-mono block">
                      سطح فناوری{" "}
                      {PersianNumberFormatter.toPersianDigits(seller.techLevel)}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <ShieldCheck size={10} />
                  آماده معامله
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
