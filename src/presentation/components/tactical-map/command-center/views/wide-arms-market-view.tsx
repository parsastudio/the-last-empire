import React from "react";
import { Anchor, Award, Users } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useWideArmsMarketForm } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-arms-market-form";
import { ArmsExporterList } from "@/presentation/components/tactical-map/command-center/views/market/arms-exporter-list";
import { ArmsUnitSelector } from "@/presentation/components/tactical-map/command-center/views/market/arms-unit-selector";
import { ArmsOrderSummary } from "@/presentation/components/tactical-map/command-center/views/market/arms-order-summary";

interface WideArmsMarketViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function WideArmsMarketView({
  nation,
  nationsMap,
  selectedTargetCode,
}: WideArmsMarketViewProps) {
  const form = useWideArmsMarketForm({
    nation,
    nationsMap,
    selectedTargetCode,
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dir-rtl text-right">
        <div className="lg:col-span-4">
          <ArmsExporterList
            sellerOptions={form.sellerOptions}
            selectedSellerId={form.selectedSellerId}
            searchQuery={form.searchQuery}
            onSearchChange={form.setSearchQuery}
            onSelectSeller={form.setSelectedSellerId}
          />
        </div>

        <div className="lg:col-span-8 space-y-4 bg-background/40 p-5 border border-border/80 rounded-3xl">
          {form.selectedSeller ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <span
                    className="text-3xl select-none"
                    role="img"
                    aria-label={form.selectedSeller.name}
                  >
                    {getFlagEmoji(form.selectedSeller.flagCode)}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>واردات تسلیحاتی از {form.selectedSeller.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Award size={11} />
                        رتبه نظامی #
                        {PersianNumberFormatter.toPersianDigits(
                          form.selectedSeller.rank,
                        )}
                      </span>
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      سطح فناوری صادرکننده:{" "}
                      {PersianNumberFormatter.toPersianDigits(
                        form.selectedSeller.techLevel,
                      )}{" "}
                      | تحویل: فوری در همین نوبت
                    </span>
                  </div>
                </div>
              </div>

              {form.isNavalBlockaded && (
                <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl flex items-center gap-2.5 text-xs text-military font-sans">
                  <Anchor size={18} className="shrink-0" />
                  <div>
                    <span className="font-bold block">
                      محاصره کامل دریایی توسط کشور متخاصم!
                    </span>
                    <p className="text-[10px] leading-relaxed text-muted-foreground mt-0.5">
                      کشتی‌های حامل محموله‌های نظامی به دلیل برتری ناوگان دریایی
                      دشمن امکان تحویل تسلیحات را ندارند.
                    </p>
                  </div>
                </div>
              )}

              <ArmsUnitSelector
                selectedUnitType={form.selectedUnitType}
                sellerTechLevel={form.selectedSeller.techLevel}
                onSelectUnit={form.setSelectedUnitType}
              />

              {form.isSellerTechEligible ? (
                <ArmsOrderSummary
                  unitPrice={form.unitPrice}
                  totalPrice={form.totalPrice}
                  quantity={form.quantity}
                  canAfford={form.canAfford}
                  isSubmitting={form.isSubmitting}
                  isEligible={form.selectedSeller.isEligible}
                  isSellerTechEligible={form.isSellerTechEligible}
                  isNavalBlockaded={form.isNavalBlockaded}
                  onQuantityChange={form.setQuantity}
                  onBuyArms={form.handleBuyArms}
                />
              ) : (
                <div className="p-4 bg-secondary/30 border border-border/60 rounded-2xl text-center text-xs text-amber-500 font-sans">
                  کشور {form.selectedSeller.name} سطح فناوری لازم (سطح{" "}
                  {PersianNumberFormatter.toPersianDigits(
                    form.unitStat.requiredTechLevel,
                  )}
                  +) برای تولید و عرضه این تجهیزات را ندارد.
                </div>
              )}
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center text-muted-foreground">
                <Users size={28} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-sm font-bold text-foreground font-sans">
                  بازار بین‌المللی تجهیزات نظامی
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  از ستون سمت راست یکی از قدرت‌های صادرکننده فعال را برای مشاهده
                  فهرست جنگ‌افزارها و واردات فوری انتخاب فرمایید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
