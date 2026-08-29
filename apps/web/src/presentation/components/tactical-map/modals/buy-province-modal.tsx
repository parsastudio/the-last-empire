import React, { useMemo, useCallback } from "react";
import {
  Coins,
  Building2,
  Users,
  ShoppingCart,
  ShieldAlert,
  Anchor,
  Compass,
  TrendingUp,
  Globe2,
  CheckCircle2,
  Wallet,
  Ban,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import {
  Nation,
  Province,
  CountryRegistry,
  ActionFactory,
  getProvinceGdp,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface BuyProvinceModalProps {
  isOpen: boolean;
  provinceId: number | null;
  humanNation: Nation | null;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  onClose: () => void;
}

function getCleanProvinceName(rawName: string): string {
  const trimmed = rawName.trim();
  if (trimmed.startsWith("استان ")) {
    return trimmed;
  }
  return `استان ${trimmed}`;
}

export function BuyProvinceModal({
  isOpen,
  provinceId,
  humanNation,
  nationsMap,
  provincesMap,
  onClose,
}: BuyProvinceModalProps) {
  const { dispatchAction, isSubmitting } = useGameActions();

  const province = useMemo(() => {
    if (!provinceId || !provincesMap) return null;
    return provincesMap[provinceId.toString()] || null;
  }, [provinceId, provincesMap]);

  const ownerNation = useMemo(() => {
    if (!province || !nationsMap) return null;
    const canonicalOwner = CountryRegistry.resolveCanonicalId(
      province.ownerNationId,
    );
    return (
      nationsMap[canonicalOwner] || nationsMap[province.ownerNationId] || null
    );
  }, [province, nationsMap]);

  const sellerProvincesCount = useMemo(() => {
    if (!ownerNation || !provincesMap) return 0;
    const canonicalOwner = CountryRegistry.resolveCanonicalId(ownerNation.id);
    return Object.values(provincesMap).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalOwner,
    ).length;
  }, [ownerNation, provincesMap]);

  const isLastProvince = sellerProvincesCount <= 1;

  const provinceGdp = useMemo(() => {
    if (!province) return 0;
    return getProvinceGdp(province);
  }, [province]);

  const purchasePrice = useMemo(() => {
    if (!provinceGdp) return 10_000_000_000;
    return Math.max(10_000_000_000, Math.floor(provinceGdp * 5));
  }, [provinceGdp]);

  const buyerTreasury = humanNation?.treasury || 0;
  const canAfford = buyerTreasury >= purchasePrice;
  const remainingTreasury = Math.max(0, buyerTreasury - purchasePrice);
  const shortageAmount = Math.max(0, purchasePrice - buyerTreasury);

  const isOwnCountry =
    !!humanNation &&
    !!province &&
    CountryRegistry.resolveCanonicalId(humanNation.id) ===
      CountryRegistry.resolveCanonicalId(province.ownerNationId);

  const hasSeaAccess = Boolean(province?.hasSeaAccess);
  const formattedProvinceName = province
    ? getCleanProvinceName(province.nameFa)
    : "استان نامشخص";

  const capacityPercentage = useMemo(() => {
    if (!province) return 0;
    const maxCap = Math.max(1, province.maxPopulationCapacity || 100000);
    return Math.round((province.population / maxCap) * 100);
  }, [province]);

  const handleExecutePurchase = useCallback(async () => {
    if (
      !humanNation ||
      !province ||
      !ownerNation ||
      isSubmitting ||
      !canAfford ||
      isOwnCountry ||
      isLastProvince
    ) {
      return;
    }

    const action = ActionFactory.buyProvince(
      humanNation.id,
      ownerNation.id,
      province.provinceId,
      purchasePrice,
    );

    const res = await dispatchAction(
      action,
      `${formattedProvinceName} با موفقیت از ${ownerNation.name} خریداری و رسماً به قلمرو کشور الحاق شد.`,
    );

    if (res.success) {
      onClose();
    }
  }, [
    humanNation,
    province,
    ownerNation,
    purchasePrice,
    isSubmitting,
    canAfford,
    isOwnCountry,
    isLastProvince,
    dispatchAction,
    formattedProvinceName,
    onClose,
  ]);

  if (!isOpen || !province || !ownerNation || !humanNation) {
    return null;
  }

  const ownerFlag = getFlagEmoji(ownerNation.flagCode || ownerNation.id);

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`خرید و الحاق سرزمینی: ${formattedProvinceName}`}
      subtitle={`قرارداد رسمی انتقال حاکمیت سرزمینی با دولت ${ownerNation.name}`}
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
                  {ownerNation.name}
                </span>
                <span className="text-[9px] font-mono font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-border/60">
                  {ownerNation.id}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-sans block">
                تعداد کل استان‌های تحت کنترل:{" "}
                {PersianNumberFormatter.toPersianDigits(sellerProvincesCount)}{" "}
                استان
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasSeaAccess ? (
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
              <Building2 size={12} className="text-gdp shrink-0" />
              <span>تولید ناخالص استان:</span>
            </div>
            <span className="font-black text-gdp text-xs block truncate">
              {PersianNumberFormatter.formatCurrency(provinceGdp, true)}
            </span>
            <span className="text-[8px] text-muted-foreground font-sans block">
              درآمد پایدار نوبتی
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
              <Users size={12} className="text-primary shrink-0" />
              <span>جمعیت و نیروی کار:</span>
            </div>
            <span className="font-black text-foreground text-xs block truncate">
              {PersianNumberFormatter.formatCompactNumber(province.population)}{" "}
              نفر
            </span>
            <span className="text-[8px] text-muted-foreground font-sans block">
              {PersianNumberFormatter.toPersianDigits(capacityPercentage)}٪
              اشغال مسکن
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
              <Globe2 size={12} className="text-treasury shrink-0" />
              <span>وسعت خاک:</span>
            </div>
            <span className="font-black text-foreground text-xs block truncate">
              {PersianNumberFormatter.toPersianDigits(
                (province.pixelCount || 0).toLocaleString("en-US"),
              )}{" "}
              پیکسل
            </span>
            <span className="text-[8px] text-muted-foreground font-sans block">
              گسترش مرزهای ملی
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
              <TrendingUp size={12} className="text-emerald-400 shrink-0" />
              <span>توجیه اقتصادی:</span>
            </div>
            <span className="font-black text-emerald-400 text-xs block font-sans">
              بسیار سودده
            </span>
            <span className="text-[8px] text-muted-foreground font-sans block">
              بازگشت اصل سرمایه در ۵ نوبت
            </span>
          </div>
        </div>

        <div className="bg-background/80 border border-border/80 p-4 rounded-3xl space-y-3 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-muted-foreground font-sans font-bold text-[11px] flex items-center gap-1.5">
              <Coins size={14} className="text-gdp" />
              <span>قیمت قطعی واگذاری سرزمینی (۵ برابر GDP):</span>
            </span>
            <span className="font-black text-sm text-gdp">
              {PersianNumberFormatter.formatCurrency(purchasePrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-secondary/40 p-2.5 rounded-xl flex items-center justify-between border border-border/40">
              <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                <Wallet size={11} className="text-primary" />
                <span>موجودی فعلی خزانه:</span>
              </span>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.formatCurrency(buyerTreasury, true)}
              </span>
            </div>

            <div className="bg-secondary/40 p-2.5 rounded-xl flex items-center justify-between border border-border/40">
              <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                <Coins size={11} className="text-gdp" />
                <span>مانده خزانه پس از خرید:</span>
              </span>
              <span
                className={`font-bold ${
                  canAfford ? "text-gdp" : "text-military"
                }`}
              >
                {canAfford
                  ? PersianNumberFormatter.formatCurrency(
                      remainingTreasury,
                      true,
                    )
                  : "کسری بودجه"}
              </span>
            </div>
          </div>
        </div>

        {isOwnCountry ? (
          <div className="p-3.5 bg-secondary/60 border border-border/60 rounded-2xl text-xs text-muted-foreground flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-primary shrink-0" />
            <span>
              این استان در حال حاضر بخشی از قلمرو قانونی امپراتوری شماست.
            </span>
          </div>
        ) : isLastProvince ? (
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5 shadow-sm">
            <Ban size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black block text-amber-400">
                عدم امکان خرید آخرین خاک مادری کشور
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                این استان تنها قلمرو باقی‌مانده کشور {ownerNation.name} است. هیچ
                حاکمیتی آخرین پایتخت خود را نمی‌فروشد؛ برای تسخیر این استان باید
                از فرمان تهاجم نظامی استفاده کنید.
              </p>
            </div>
          </div>
        ) : !canAfford ? (
          <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl text-xs text-military flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>
                موجودی خزانه ملی برای تأمین قیمت خرید این استان کافی نیست.
              </span>
            </div>
            <span className="font-mono font-bold text-[11px] bg-military/20 px-2 py-0.5 rounded-lg border border-military/30">
              کسری:{" "}
              {PersianNumberFormatter.formatCurrency(shortageAmount, true)}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleExecutePurchase}
          disabled={
            !canAfford || isOwnCountry || isLastProvince || isSubmitting
          }
          className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xl shadow-gdp/20 hover:scale-[1.005] active:scale-[0.995] flex items-center justify-center gap-2 border border-gdp/30"
        >
          {isSubmitting ? (
            <span>در حال امضا و ثبت انتقال سند سرزمینی...</span>
          ) : isLastProvince ? (
            <>
              <Ban size={16} />
              <span>آخرین استان حاکمیت غیرقابل خرید است</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>
                خرید و الحاق رسمی {formattedProvinceName} (
                {PersianNumberFormatter.formatCurrency(purchasePrice, true)})
              </span>
            </>
          )}
        </button>
      </div>
    </UnifiedModalShell>
  );
}
