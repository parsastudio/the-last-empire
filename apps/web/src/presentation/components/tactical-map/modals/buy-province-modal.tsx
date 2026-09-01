import React from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { useBuyProvinceForm } from "./buy-province/hooks/use-buy-province-form";
import { BuyProvinceMetricsGrid } from "./buy-province/components/buy-province-metrics-grid";
import { BuyProvinceStatusBanners } from "./buy-province/components/buy-province-status-banners";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  Coins,
  HandCoins,
  Loader2,
  ArrowLeftRight,
  Wallet,
} from "lucide-react";
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
      subtitle={`پیش‌نویس قرارداد الحاق دیپلماتیک ${form.formattedProvinceName}`}
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4 rounded-3xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {getFlagEmoji(humanNation.flagCode)}
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-foreground block">
                {humanNation.name}
              </span>
              <span className="text-[10px] text-primary font-mono font-bold">
                خریدار و طرف الحاق
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-xl bg-gdp/15 border border-gdp/30 text-gdp shadow-sm">
              <ArrowLeftRight size={16} />
            </div>
            <span className="text-[9px] font-mono font-bold text-muted-foreground">
              معامله سرزمینی
            </span>
          </div>

          <div className="flex items-center gap-3 text-left dir-ltr">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {getFlagEmoji(form.ownerNation.flagCode)}
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-xs font-black text-foreground block">
                {form.ownerNation.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono font-bold">
                مالک فعلی استان
              </span>
            </div>
          </div>
        </div>

        <BuyProvinceMetricsGrid
          provinceGdp={form.provinceGdp}
          factoriesCount={form.province.factoriesCount}
          maxSlots={form.province.maxSlots}
          pixelCount={form.province.pixelCount || 0}
          hasSeaAccess={form.hasSeaAccess}
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

        <div className="bg-card/90 border border-border/80 p-4 rounded-3xl space-y-3 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
            <span className="font-sans text-muted-foreground text-xs font-bold flex items-center gap-1.5">
              <Coins size={14} className="text-gdp" />
              <span>مبلغ قرارداد الحاق رسمی:</span>
            </span>
            <span className="font-black text-base text-gdp">
              {PersianNumberFormatter.formatCurrency(form.purchasePrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
            <div className="bg-background/60 p-2.5 rounded-xl border border-border/40 space-y-0.5">
              <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                <Wallet size={11} className="text-primary" />
                موجودی فعلی خزانه:
              </span>
              <span className="font-bold text-foreground block">
                {PersianNumberFormatter.formatCurrency(form.buyerTreasury)}
              </span>
            </div>

            <div className="bg-background/60 p-2.5 rounded-xl border border-border/40 space-y-0.5">
              <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                <HandCoins size={11} className="text-gdp" />
                موجودی پس از پرداخت:
              </span>
              <span
                className={`font-bold block ${form.canAfford ? "text-gdp" : "text-military"}`}
              >
                {PersianNumberFormatter.formatCurrency(form.remainingTreasury)}
              </span>
            </div>
          </div>

          <button
            onClick={form.handleExecutePurchase}
            disabled={isButtonDisabled}
            className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-gdp/20 hover:scale-[1.005] active:scale-[0.995]"
          >
            {form.isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Coins size={16} />
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
                          : `امضا و الحاق دائمی ${form.formattedProvinceName} (${PersianNumberFormatter.formatCurrency(form.purchasePrice)})`}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
