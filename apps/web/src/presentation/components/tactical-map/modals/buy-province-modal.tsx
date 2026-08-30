import React from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { useBuyProvinceForm } from "./buy-province/hooks/use-buy-province-form";
import { BuyProvinceMetricsGrid } from "./buy-province/components/buy-province-metrics-grid";
import { BuyProvinceStatusBanners } from "./buy-province/components/buy-province-status-banners";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Coins, HandCoins, Loader2 } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface BuyProvinceModalProps {
  isOpen: boolean;
  provinceId: number | null;
  humanNation: Nation | null;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  onClose: () => void;
}

export function BuyProvinceModal({
  isOpen,
  provinceId,
  humanNation,
  nationsMap,
  provincesMap,
  onClose,
}: BuyProvinceModalProps) {
  const form = useBuyProvinceForm({
    provinceId,
    humanNation,
    nationsMap,
    provincesMap,
    onClose,
  });

  if (!isOpen || !form.province || !form.ownerNation || !humanNation) {
    return null;
  }

  const isButtonDisabled =
    !form.canAfford ||
    form.isOwnCountry ||
    form.isLastProvince ||
    form.isLastCoastalProvince ||
    !form.isGeographicallyConnected ||
    form.isSubmitting;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="اتاق مذاکرات خرید و الحاق سرزمینی"
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="bg-secondary/40 border border-border/80 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {getFlagEmoji(humanNation.flagCode)}
            </span>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-foreground block">
                {humanNation.name}
              </span>
              <span className="text-[10px] text-primary font-mono font-bold">
                خریدار و طرف الحاق
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gdp font-mono font-bold text-xs bg-gdp/10 border border-gdp/30 px-3 py-1 rounded-xl">
            <HandCoins size={14} />
            <span>معامله سرزمینی</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="space-y-0.5 text-left">
              <span className="text-xs font-black text-foreground block">
                {form.ownerNation.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono font-bold">
                مالک فعلی استان
              </span>
            </div>
            <span className="text-2xl">
              {getFlagEmoji(form.ownerNation.flagCode)}
            </span>
          </div>
        </div>

        <BuyProvinceMetricsGrid
          provinceGdp={form.provinceGdp}
          factoriesCount={form.province.factoriesCount}
          maxSlots={form.province.maxSlots}
          pixelCount={form.province.pixelCount || 0}
          costMultiplier={form.costMultiplier}
        />

        <BuyProvinceStatusBanners
          isOwnCountry={form.isOwnCountry}
          isLastProvince={form.isLastProvince}
          isLastCoastalProvince={form.isLastCoastalProvince}
          isGeographicallyConnected={form.isGeographicallyConnected}
          canAfford={form.canAfford}
          shortageAmount={form.shortageAmount}
          ownerNationName={form.ownerNation.name}
        />

        <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="font-sans text-muted-foreground text-[11px]">
              مبلغ مصوب قرارداد الحاق:
            </span>
            <span className="font-extrabold text-sm text-gdp">
              {PersianNumberFormatter.formatCurrency(form.purchasePrice)}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-sans text-[11px]">
              موجودی خزانه پس از خرید:
            </span>
            <span className="font-bold text-foreground">
              {PersianNumberFormatter.formatCurrency(form.remainingTreasury)}
            </span>
          </div>

          <button
            onClick={form.handleExecutePurchase}
            disabled={isButtonDisabled}
            className="w-full py-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-gdp/20"
          >
            {form.isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Coins size={14} />
            )}
            <span>
              {form.isSubmitting
                ? "در حال ثبت معاهده و انتقال مالکیت..."
                : form.isOwnCountry
                  ? "این استان در حال حاضر در تملک کشور شماست"
                  : form.isLastProvince
                    ? "امکان خرید آخرین استان کشور فروشنده وجود ندارد"
                    : form.isLastCoastalProvince
                      ? "فروشنده حاضر به واگذاری تنها دسترسی دریایی خود نیست"
                      : !form.isGeographicallyConnected
                        ? "عدم وجود پیوستگی سرزمینی یا مسیر دریایی"
                        : !form.canAfford
                          ? "موجودی خزانه برای این معامله کافی نیست"
                          : `امضای سند و الحاق رسمی (${PersianNumberFormatter.formatCurrency(form.purchasePrice)})`}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
