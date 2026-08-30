"use client";

import React, { useState } from "react";
import { ShoppingCart, Cpu, Loader2, ShieldCheck, Zap } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { CountryRegistry } from "@/domain/data/countries";

interface IndustryImportTabProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
}

export function IndustryImportTab({
  nation,
  nationsMap,
  provincesMap,
}: IndustryImportTabProps) {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const totalFactories = provincesMap
    ? Object.values(provincesMap)
        .filter((p) => p.ownerNationId === nation.id)
        .reduce((sum, p) => sum + p.factoriesCount, 0)
    : 10;

  const currentEquipmentTech = nation.equipmentTechLevel;

  const sellers = nationsMap
    ? Object.values(nationsMap).filter(
        (n) =>
          n.isAlive &&
          n.id !== nation.id &&
          n.industrialLevel > currentEquipmentTech,
      )
    : [];

  sellers.sort((a, b) => b.industrialLevel - a.industrialLevel);

  const selectedSeller =
    sellers.find((s) => s.id === selectedSellerId) || sellers[0] || null;

  const techDiff = selectedSeller
    ? Math.max(0, selectedSeller.industrialLevel - currentEquipmentTech)
    : 0;

  const importCost = selectedSeller
    ? Math.floor(
        totalFactories *
          IndustryCalculator.calculateModernizeUnitCost(
            currentEquipmentTech,
            selectedSeller.industrialLevel,
          ) *
          1.25,
      )
    : 0;

  const canAfford = selectedSeller
    ? nation.treasury >= importCost && importCost > 0
    : false;

  const handlePurchaseEquipment = async () => {
    if (!selectedSeller || !canAfford || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const action = ActionFactory.buyIndustrialEquipment(
        nation.id,
        selectedSeller.id,
        techDiff,
      );
      await dispatchAction(
        action,
        `قرارداد واردات ماشین‌آلات صنعتی پیشرفته از ${selectedSeller.name} منعقد و تراز خطوط تولید به لِوِل ${PersianNumberFormatter.toPersianDigits(selectedSeller.industrialLevel.toFixed(1))} ارتقا یافت.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right font-sans animate-in fade-in duration-200">
      <div className="bg-card/90 border border-border/80 p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary" />
            <h3 className="text-sm font-black text-foreground">
              بازار بین‌المللی تجهیزات و خطوط تولید صنعتی
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-muted-foreground">
            تعداد کارخانجات نیازمند ارتقا:{" "}
            {PersianNumberFormatter.formatNumberWithCommas(totalFactories)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          در صورتی که دانش بومی کشور برای ساخت ماشین‌آلات پیشرفته کافی نباشد،
          می‌توانید فناوری و خطوط تولید را مستقیماً از قطب‌های صنعتی جهان وارد
          نمایید تا بهره‌وری کارخانجات فوراً افزایش یابد.
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="p-8 bg-card/60 border border-border/60 rounded-3xl text-center space-y-2">
          <ShieldCheck size={28} className="text-emerald-400 mx-auto" />
          <span className="text-sm font-black text-foreground block">
            پیشرفته‌ترین صنایع در اختیار شماست
          </span>
          <p className="text-xs text-muted-foreground">
            هیچ کشوری در جهان فناوری صنعتی بالاتری نسبت به تراز تجهیزات فعلی شما
            ندارد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono block px-1">
              کشورهای صادرکننده ماشین‌آلات پیشرفته
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pl-1">
              {sellers.map((seller) => {
                const isSelected = selectedSeller?.id === seller.id;
                const flag = getFlagEmoji(seller.flagCode || seller.id);
                const sellerCost = Math.floor(
                  totalFactories *
                    IndustryCalculator.calculateModernizeUnitCost(
                      currentEquipmentTech,
                      seller.industrialLevel,
                    ) *
                    1.25,
                );

                return (
                  <div
                    key={seller.id}
                    onClick={() => setSelectedSellerId(seller.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-md"
                        : "bg-secondary/40 border-border/60 hover:bg-secondary/70 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{flag}</span>
                        <div>
                          <span className="text-xs font-black text-foreground block">
                            {seller.name}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {CountryRegistry.resolveCanonicalId(seller.id)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-background/80 px-2 py-0.5 rounded-lg border border-border/50 text-[11px] font-mono font-bold text-gdp">
                        <Cpu size={11} />
                        <span>
                          لِوِل{" "}
                          {PersianNumberFormatter.toPersianDigits(
                            seller.industrialLevel.toFixed(1),
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 font-mono">
                      <span className="text-[10px] text-muted-foreground font-sans">
                        مجموع هزینه قرارداد:
                      </span>
                      <span className="font-bold text-foreground">
                        {PersianNumberFormatter.formatCurrency(sellerCost)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedSeller && (
            <div className="bg-card/90 border border-border/80 p-5 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Zap size={16} className="text-primary" />
                  <h4 className="text-xs font-black text-foreground">
                    خلاصه قرارداد واردات
                  </h4>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center bg-secondary/40 p-2.5 rounded-xl border border-border/50">
                    <span className="text-muted-foreground font-sans">
                      تأمین‌کننده:
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedSeller.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-secondary/40 p-2.5 rounded-xl border border-border/50">
                    <span className="text-muted-foreground font-sans">
                      جهش فناوری:
                    </span>
                    <span className="font-bold text-gdp">
                      {PersianNumberFormatter.toPersianDigits(
                        currentEquipmentTech.toFixed(1),
                      )}{" "}
                      ➔{" "}
                      {PersianNumberFormatter.toPersianDigits(
                        selectedSeller.industrialLevel.toFixed(1),
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-secondary/40 p-2.5 rounded-xl border border-border/50">
                    <span className="text-muted-foreground font-sans">
                      کل مبلغ قابل پرداخت:
                    </span>
                    <span className="font-bold text-foreground">
                      {PersianNumberFormatter.formatCurrency(importCost)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchaseEquipment}
                disabled={!canAfford || isSubmitting}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ShoppingCart size={14} />
                )}
                <span>
                  {!canAfford
                    ? "موجودی خزانه ناکافی است"
                    : `انعقاد قرارداد واردات (${PersianNumberFormatter.formatCurrency(importCost)})`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
