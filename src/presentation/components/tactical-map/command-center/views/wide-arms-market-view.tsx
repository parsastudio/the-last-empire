import React from "react";
import { Search, ShoppingCart, Coins, Zap, Lock, Anchor } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";
import { useWideArmsMarketForm } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-arms-market-form";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

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

  const availableUnitsList = Object.values(MILITARY_UNIT_STATS);

  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dir-rtl text-right">
        <div className="lg:col-span-4 space-y-3 bg-background/30 p-4 border border-border/60 rounded-3xl">
          <div className="flex items-center gap-2 pb-1">
            <ShoppingCart size={14} className="text-gdp" />
            <span className="text-xs font-bold text-foreground">
              انتخاب کشور صادرکننده اسلحه
            </span>
          </div>

          <div className="relative">
            <Search
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="جستجوی نام یا نماد..."
              value={form.searchQuery}
              onChange={(e) => form.setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right"
            />
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {form.sellerOptions.map((seller) => {
              const isSelected = seller.id === form.selectedSellerId;
              const flag = getFlagEmoji(seller.flagCode);

              return (
                <button
                  key={seller.id}
                  onClick={() => form.setSelectedSellerId(seller.id)}
                  className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? "bg-secondary border-primary font-bold shadow-sm"
                      : seller.isEligible
                        ? "bg-background/40 border-border/60 hover:bg-secondary/40"
                        : "bg-background/20 border-border/30 opacity-60"
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
                      <span className="block">{seller.name}</span>
                      <span className="text-[9px] text-amber-500 font-mono block">
                        سطح فناوری{" "}
                        {PersianNumberFormatter.toPersianDigits(
                          seller.techLevel,
                        )}
                      </span>
                    </div>
                  </div>

                  {seller.isEligible ? (
                    <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                      آماده معامله
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] bg-military/15 text-military border border-military/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Lock size={10} />
                      تحریم/مخالف
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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
                    <h3 className="text-sm font-extrabold text-foreground">
                      واردات تسلیحاتی از {form.selectedSeller.name}
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

              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono block">
                  انتخاب نوع تجهیزات نظامی جهت خرید
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {availableUnitsList.map((unit) => {
                    const isSelected = form.selectedUnitType === unit.type;
                    const isTechOk =
                      form.selectedSeller &&
                      form.selectedSeller.techLevel >= unit.requiredTechLevel;

                    return (
                      <button
                        key={unit.type}
                        disabled={!isTechOk}
                        onClick={() =>
                          form.setSelectedUnitType(unit.type as UnitType)
                        }
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-secondary border-primary shadow-sm"
                            : isTechOk
                              ? "bg-background/40 border-border/60 hover:bg-secondary/40"
                              : "bg-background/20 border-border/30 opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-foreground">
                            {unit.nameFa}
                          </span>
                          {!isTechOk && (
                            <span className="text-[9px] text-military font-mono flex items-center gap-1">
                              <Lock size={10} />
                              سطح{" "}
                              {PersianNumberFormatter.toPersianDigits(
                                unit.requiredTechLevel,
                              )}
                              +
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          قیمت پایه ساخت:{" "}
                          {PersianNumberFormatter.formatCurrency(
                            unit.moneyCost,
                          )}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.isSellerTechEligible ? (
                <div className="space-y-4 pt-2 border-t border-border/40 font-mono text-xs">
                  <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-3 font-sans">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground font-sans">
                        قیمت خرید فوری هر یگان (۲ برابر هزینه ساخت):
                      </span>
                      <span className="font-bold text-gdp text-sm">
                        {PersianNumberFormatter.formatCurrency(form.unitPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground font-sans">
                        مبلغ کل سفارش:
                      </span>
                      <span className="font-extrabold text-gdp text-base flex items-center gap-1">
                        <Coins size={16} />
                        {PersianNumberFormatter.formatCurrency(form.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-sans">
                        تعداد سفارش خرید:
                      </span>
                      <span className="font-bold text-foreground">
                        {PersianNumberFormatter.toPersianDigits(
                          form.quantity.toLocaleString("en-US"),
                        )}{" "}
                        یگان
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={form.quantity}
                        onChange={(e) =>
                          form.setQuantity(Number(e.target.value))
                        }
                        className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg"
                      />

                      <div className="flex items-center gap-1 font-mono">
                        <button
                          type="button"
                          disabled={form.quantity <= 1}
                          onClick={() => form.setQuantity(form.quantity - 1)}
                          className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={form.quantity}
                          onChange={(e) =>
                            form.setQuantity(
                              Math.max(1, Number(e.target.value)),
                            )
                          }
                          className="w-14 bg-secondary/80 border border-border/80 rounded-lg py-1 px-1 text-center font-bold text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => form.setQuantity(form.quantity + 1)}
                          className="w-7 h-7 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <PercentageSelector
                      options={[
                        { pct: 1, label: "۱ یگان" },
                        { pct: 5, label: "۵ یگان" },
                        { pct: 10, label: "۱۰ یگان" },
                        { pct: 25, label: "۲۵ یگان" },
                      ]}
                      onSelect={(val) => form.setQuantity(val)}
                      colorVariant="gdp"
                    />
                  </div>

                  <button
                    onClick={form.handleBuyArms}
                    disabled={
                      !form.selectedSeller.isEligible ||
                      !form.isSellerTechEligible ||
                      form.isNavalBlockaded ||
                      !form.canAfford ||
                      form.isSubmitting
                    }
                    className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:opacity-40 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-gdp/10 flex items-center justify-center gap-2"
                  >
                    <Zap size={16} />
                    <span>
                      {form.isSubmitting
                        ? "در حال ثبت سفارش و تحویل فوری..."
                        : form.isNavalBlockaded
                          ? "غیرقابل تحویل به دلیل محاصره کامل دریایی"
                          : !form.canAfford
                            ? "موجودی خزانه ناکافی جهت خرید"
                            : `تایید خرید فوری و تحویل در همین نوبت (${PersianNumberFormatter.formatCurrency(form.totalPrice)})`}
                    </span>
                  </button>
                </div>
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
            <div className="py-20 text-center text-xs text-muted-foreground italic">
              یک کشور صادرکننده را از لیست انتخاب کنید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
