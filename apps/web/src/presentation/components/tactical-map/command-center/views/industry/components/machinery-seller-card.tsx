import React from "react";
import { Cpu } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { CountryRegistry } from "@/domain/data/countries";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface MachinerySellerCardProps {
  seller: Nation;
  isSelected: boolean;
  onSelect: (sellerId: string) => void;
}

export function MachinerySellerCard({
  seller,
  isSelected,
  onSelect,
}: MachinerySellerCardProps) {
  const { formatLevel } = useLocaleFormatter();
  const flag = getFlagEmoji(seller.flagCode || seller.id);
  const canonicalId = CountryRegistry.resolveCanonicalId(seller.id);

  return (
    <button
      type="button"
      onClick={() => onSelect(seller.id)}
      className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? "bg-primary/15 border-primary shadow-md ring-1 ring-primary/40"
          : "bg-secondary/40 border-border/60 hover:bg-secondary/70 hover:border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl select-none">{flag}</span>
        <div className="space-y-0.5">
          <span className="text-xs font-black text-foreground block">
            {seller.name}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {canonicalId}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-xl border border-border/50 text-[11px] font-mono font-bold text-gdp shrink-0">
        <Cpu size={12} />
        <span>{formatLevel(seller.industrialLevel)}</span>
      </div>
    </button>
  );
}
