import React from "react";
import {
  Coins,
  ShoppingCart,
  ShieldAlert,
  Anchor,
  Compass,
  Wallet,
  Ban,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation, Province } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useBuyProvinceForm } from "./buy-province/hooks/use-buy-province-form";
import { BuyProvinceMetricsGrid } from "./buy-province/components/buy-province-metrics-grid";
import { BuyProvinceStatusBanners } from "./buy-province/components/buy-province-status-banners";

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

  const ownerFlag = getFlagEmoji(
    form.ownerNation.flagCode || form.ownerNation.id,
  );

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`خرید و الحاق سرزمینی: ${form.formattedProvinceName}`}
      subtitle={`قرارداد رسمی انتقال حاکمیت سرزمینی با دولت ${form.ownerNation.name}`}
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4 rounded-3xl flex items-center justify-between gap-3 shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/70 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {ownerFlag}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-foreground block">
                  {form.ownerNation.name}
                </span>
                <span className="text-[9px] font-mono font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-border/60">
                  {form.ownerNation.id}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-sans block">
                تعداد کل استان‌های تحت کنترل:{" "}
                {PersianNumberFormatter.toPersianDigits(
                  form.sellerProvincesCount,
                )}{" "}
                استان
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {form.hasSeaAccess ? (
              <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Anchor size={13} className="text-cyan-400" />
                <span>استان ساحلی (آب‌های آزاد)</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Compass size={13} className="text-amber-400" />
                <span>محصور در خشکی</span>
              </span>
            )}
          </div>
        </div>

        <BuyProvinceMetricsGrid
          provinceGdp={form.provinceGdp}
          population={form.province.population}
          capacityPercentage={form.capacityPercentage}
          pixelCount={form.province.pixelCount || 0}
          costMultiplier={form.costMultiplier}
        />

        <div className="bg-background/80 border border-border/80 p-4 rounded-3xl space-y-3 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-muted-foreground font-sans font-bold text-[11px] flex items-center gap-1.5">
              <Coins size={14} className="text-gdp" />
              <span>
                قیمت قطعی واگذاری سرزمینی (
                {PersianNumberFormatter.toPersianDigits(form.costMultiplier)}{" "}
                برابر GDP):
              </span>
            </span>
            <span className="font-black text-sm text-gdp">
              {PersianNumberFormatter.formatCurrency(form.purchasePrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-secondary/40 p-2.5 rounded-xl flex items-center justify-between border border-border/40">
              <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                <Wallet size={11} className="text-primary" />
                <span>موجودی فعلی خزانه:</span>
              </span>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.formatCurrency(
                  form.buyerTreasury,
                  true,
                )}
              </span>
            </div>

            <div className="bg-secondary/40 p-2.5 rounded-xl flex items-center justify-between border border-border/40">
              <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                <Coins size={11} className="text-gdp" />
                <span>مانده خزانه پس از خرید:</span>
              </span>
              <span
                className={`font-bold ${form.canAfford ? "text-gdp" : "text-military"}`}
              >
                {form.canAfford
                  ? PersianNumberFormatter.formatCurrency(
                      form.remainingTreasury,
                      true,
                    )
                  : "کسری بودجه"}
              </span>
            </div>
          </div>
        </div>

        <BuyProvinceStatusBanners
          ownerNationName={form.ownerNation.name}
          isOwnCountry={form.isOwnCountry}
          isLastProvince={form.isLastProvince}
          isLastCoastalProvince={form.isLastCoastalProvince}
          isGeographicallyConnected={form.isGeographicallyConnected}
          canAfford={form.canAfford}
          shortageAmount={form.shortageAmount}
        />

        <button
          type="button"
          onClick={form.handleExecutePurchase}
          disabled={
            !form.canAfford ||
            form.isOwnCountry ||
            form.isLastProvince ||
            form.isLastCoastalProvince ||
            !form.isGeographicallyConnected ||
            form.isSubmitting
          }
          className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xl shadow-gdp/20 hover:scale-[1.005] active:scale-[0.995] flex items-center justify-center gap-2 border border-gdp/30"
        >
          {form.isSubmitting ? (
            <span>در حال امضا و ثبت انتقال سند سرزمینی...</span>
          ) : form.isLastProvince ? (
            <>
              <Ban size={16} />
              <span>آخرین استان حاکمیت غیرقابل خرید است</span>
            </>
          ) : form.isLastCoastalProvince ? (
            <>
              <Ban size={16} />
              <span>آخرین استان ساحلی غیرقابل خرید است</span>
            </>
          ) : !form.isGeographicallyConnected ? (
            <>
              <Ban size={16} />
              <span>عدم اتصال سرزمینی یا دریایی به استان</span>
            </>
          ) : !form.canAfford ? (
            <>
              <ShieldAlert size={16} />
              <span>موجودی خزانه ناکافی است</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>
                خرید و الحاق رسمی {form.formattedProvinceName} (
                {PersianNumberFormatter.formatCurrency(
                  form.purchasePrice,
                  true,
                )}
                )
              </span>
            </>
          )}
        </button>
      </div>
    </UnifiedModalShell>
  );
}
