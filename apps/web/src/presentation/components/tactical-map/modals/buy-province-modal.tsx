import React, { useMemo, useCallback } from "react";
import {
  Coins,
  MapPin,
  Building2,
  Users,
  ShoppingCart,
  ShieldAlert,
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

  const provinceGdp = useMemo(() => {
    if (!province) return 0;
    return getProvinceGdp(province);
  }, [province]);

  const purchasePrice = useMemo(() => {
    if (!provinceGdp) return 10_000_000_000;
    return Math.max(10_000_000_000, Math.floor(provinceGdp * 5));
  }, [provinceGdp]);

  const canAfford = (humanNation?.treasury || 0) >= purchasePrice;
  const isOwnCountry =
    !!humanNation &&
    !!province &&
    CountryRegistry.resolveCanonicalId(humanNation.id) ===
      CountryRegistry.resolveCanonicalId(province.ownerNationId);

  const handleExecutePurchase = useCallback(async () => {
    if (
      !humanNation ||
      !province ||
      !ownerNation ||
      isSubmitting ||
      !canAfford
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
      `استان (${province.nameFa}) با موفقیت از ${ownerNation.name} خریداری و به خاک کشور الحاق شد.`,
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
    dispatchAction,
    onClose,
  ]);

  if (!isOpen || !province || !ownerNation || !humanNation) {
    return null;
  }

  const ownerFlag = getFlagEmoji(ownerNation.flagCode || ownerNation.id);

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`خرید و الحاق سرزمینی: استان ${province.nameFa}`}
      subtitle={`مالکیت قانونی: دولت ${ownerNation.name}`}
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div className="bg-secondary/40 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{ownerFlag}</span>
            <div className="space-y-0.5">
              <span className="text-xs font-black text-foreground block">
                {ownerNation.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                مالک فعلی استان
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-background/80 px-2.5 py-1 rounded-xl border border-border/50">
            <MapPin size={13} className="text-primary" />
            <span className="font-bold">{province.nameFa}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-secondary/30 border border-border/60 p-3 rounded-xl space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-sans block flex items-center gap-1">
              <Building2 size={11} className="text-gdp" />
              تولید ناخالص استان:
            </span>
            <span className="font-bold text-gdp block">
              {PersianNumberFormatter.formatCurrency(provinceGdp, true)}
            </span>
          </div>

          <div className="bg-secondary/30 border border-border/60 p-3 rounded-xl space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-sans block flex items-center gap-1">
              <Users size={11} className="text-primary" />
              جمعیت استان:
            </span>
            <span className="font-bold text-foreground block">
              {PersianNumberFormatter.formatCompactNumber(province.population)}{" "}
              نفر
            </span>
          </div>
        </div>

        <div className="bg-background/80 border border-border/70 p-3.5 rounded-2xl space-y-2 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px]">
              قیمت پیشنهادی خرید سرزمینی (۵ برابر GDP):
            </span>
            <span className="font-black text-sm text-gdp">
              {PersianNumberFormatter.formatCurrency(purchasePrice)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-sans">
            <span>موجودی خزانه ملی شما:</span>
            <span
              className={`font-mono font-bold ${
                canAfford ? "text-gdp" : "text-military"
              }`}
            >
              {PersianNumberFormatter.formatCurrency(humanNation.treasury)}
            </span>
          </div>
        </div>

        {isOwnCountry ? (
          <div className="p-3 bg-secondary/60 border border-border/60 rounded-xl text-xs text-muted-foreground flex items-center gap-2">
            <ShieldAlert size={15} className="text-primary shrink-0" />
            <span>این استان متعلق به کشور خود شماست.</span>
          </div>
        ) : !canAfford ? (
          <div className="p-3 bg-military/15 border border-military/40 rounded-xl text-xs text-military flex items-center gap-2">
            <ShieldAlert size={15} className="shrink-0" />
            <span>موجودی خزانه ملی برای تامین قیمت این استان کافی نیست.</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleExecutePurchase}
          disabled={!canAfford || isOwnCountry || isSubmitting}
          className="w-full py-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-gdp/20 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={15} />
          <span>
            {isSubmitting
              ? "در حال ثبت معامله سرزمینی..."
              : `خرید و الحاق رسمی استان (${PersianNumberFormatter.formatCurrency(purchasePrice, true)})`}
          </span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
