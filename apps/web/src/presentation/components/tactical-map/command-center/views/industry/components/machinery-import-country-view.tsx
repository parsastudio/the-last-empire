import React from "react";
import { ArrowRight, Wallet, Cpu, TrendingUp, Info } from "lucide-react";
import { Nation, PersianNumberFormatter } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { FactoryTiersGrid } from "./factory-tiers-grid";

interface MachineryImportCountryViewProps {
  buyerNation: Nation;
  sellerNation: Nation;
  totalFactories: number;
  onBack: () => void;
}

export function MachineryImportCountryView({
  buyerNation,
  sellerNation,
  totalFactories,
  onBack,
}: MachineryImportCountryViewProps) {
  const sellerFlag = getFlagEmoji(sellerNation.flagCode || sellerNation.id);
  const techDelta = Number(
    Math.max(
      0,
      sellerNation.industrialLevel - buyerNation.industrialLevel,
    ).toFixed(1),
  );
  const multiplier = Math.pow(1.5, techDelta);

  return (
    <div className="space-y-4 font-sans dir-rtl text-right animate-in fade-in duration-200">
      <div className="flex items-center justify-between bg-secondary/40 border border-border/70 p-3.5 rounded-2xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-secondary hover:bg-secondary/80 border border-border/70 rounded-xl text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <ArrowRight size={14} />
            <span>فهرست صادرکنندگان</span>
          </button>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">{sellerFlag}</span>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-foreground">
                واردات تجهیزات و ابزارآلات صنعتی از {sellerNation.name}
              </h4>
              <span className="text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <Cpu size={11} />
                <span>
                  فناوری صنعتی: لِوِل{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    sellerNation.industrialLevel.toFixed(1),
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-secondary/80 border border-border/60 px-3 py-1.5 rounded-xl">
          <Wallet size={13} className="text-primary" />
          <span className="text-muted-foreground font-sans">
            خزانه ملی شما:
          </span>
          <span className="font-extrabold text-gdp text-xs">
            {PersianNumberFormatter.formatCurrency(buyerNation.treasury)}
          </span>
        </div>
      </div>

      <div className="p-3 bg-secondary/30 border border-border/60 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-muted-foreground font-sans text-[11px]">
          <Info size={14} className="text-primary shrink-0" />
          <span>
            {techDelta > 0 ? (
              <>
                شکاف فناوری صنعتی با صادرکننده:{" "}
                <strong className="text-primary font-mono">
                  +{PersianNumberFormatter.toPersianDigits(techDelta)}
                </strong>{" "}
                سطح (ضریب هزینه واردات:{" "}
                <strong className="text-amber-400 font-mono">
                  {PersianNumberFormatter.toPersianDigits(
                    multiplier.toFixed(2),
                  )}
                  x
                </strong>
                ).
              </>
            ) : (
              "سطح فناوری صنعتی این کشور برابر با شماست."
            )}
          </span>
        </div>

        {techDelta > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-gdp bg-gdp/10 px-2.5 py-1 rounded-xl border border-gdp/20 shrink-0">
            <TrendingUp size={12} />
            <span>
              ضریب واردات:{" "}
              {PersianNumberFormatter.toPersianDigits(multiplier.toFixed(2))}x
            </span>
          </div>
        )}
      </div>

      <FactoryTiersGrid
        nationId={buyerNation.id}
        treasury={buyerNation.treasury}
        batches={buyerNation.factoryTiers}
        totalFactories={totalFactories}
        targetTechLevel={sellerNation.industrialLevel}
        buyerIndustrialLevel={buyerNation.industrialLevel}
        sellerId={sellerNation.id}
        actionType="IMPORT"
        actionLabel="واردات و تجهیز"
      />
    </div>
  );
}
