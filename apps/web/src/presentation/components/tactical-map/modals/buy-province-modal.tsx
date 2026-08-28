"use client";

import React, { useMemo, useState } from "react";
import {
  Coins,
  Anchor,
  Globe2,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import {
  Nation,
  Province,
  ProvinceBuyoutCalculator,
  ActionFactory,
} from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface BuyProvinceModalProps {
  isOpen: boolean;
  provinceId: number | null;
  humanNation: Nation | null;
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
  onClose: () => void;
}

export function BuyProvinceModal({
  isOpen,
  provinceId,
  humanNation,
  provincesMap,
  nationsMap,
  onClose,
}: BuyProvinceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dispatchAction } = useGameActions();

  const province = useMemo(() => {
    if (!provinceId || !provincesMap) return null;
    return provincesMap[provinceId.toString()] || null;
  }, [provinceId, provincesMap]);

  const sellerNation = useMemo(() => {
    if (!province || !nationsMap) return null;
    return nationsMap[province.ownerNationId] || null;
  }, [province, nationsMap]);

  const evaluation = useMemo(() => {
    if (!humanNation || !provinceId) {
      return null;
    }
    return ProvinceBuyoutCalculator.evaluate(
      humanNation,
      provinceId,
      provincesMap,
      nationsMap,
    );
  }, [humanNation, provinceId, provincesMap, nationsMap]);

  if (!isOpen || !province || !humanNation || !sellerNation || !evaluation) {
    return null;
  }

  const buyerFlag = getFlagEmoji(humanNation.flagCode || humanNation.id);
  const sellerFlag = getFlagEmoji(sellerNation.flagCode || sellerNation.id);

  const handleBuy = async () => {
    if (!evaluation.canBuy || isSubmitting) return;

    try {
      setIsSubmitting(true);
      TacticalSound.playCoinSound();
      const action = ActionFactory.buyProvince(
        humanNation.id,
        province.provinceId,
      );
      const res = await dispatchAction(
        action,
        `استان ${province.nameFa} با موفقیت خریداری و به قلمرو ملی ملحق گردید.`,
      );
      if (res.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`پیشنهاد خرید دیپلماتیک استان ${province.nameFa}`}
      subtitle="الحاق قطعی قلمرو بدون جنگ و بدون تلفات زیرساخت"
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div className="bg-gradient-to-r from-emerald-950/40 via-card to-cyan-950/30 border border-emerald-500/40 p-4.5 rounded-3xl flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {buyerFlag}
            </div>
            <div>
              <span className="text-xs font-black text-foreground block">
                {humanNation.name}
              </span>
              <span className="text-[10px] font-mono text-gdp font-bold bg-gdp/15 px-2 py-0.5 rounded-md border border-gdp/30 inline-block mt-0.5">
                خریدار رسمی قلمرو
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-xl bg-gdp/15 text-gdp border border-gdp/30 shadow-sm">
              <Coins size={18} className="animate-pulse" />
            </div>
            <span className="text-[9px] font-mono text-muted-foreground font-black tracking-widest">
              BUYOUT
            </span>
          </div>

          <div className="flex items-center gap-3 text-left dir-ltr">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {sellerFlag}
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-foreground block">
                {sellerNation.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground font-bold bg-secondary px-2 py-0.5 rounded-md border border-border/60 inline-block mt-0.5">
                کشور فروشنده
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <Building2 size={11} className="text-primary" />
              اقتصاد استان:
            </span>
            <span className="font-extrabold text-foreground block">
              {PersianNumberFormatter.formatCurrency(
                evaluation.provinceGdp,
                true,
              )}
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <Users size={11} className="text-primary" />
              جمعیت الحاقی:
            </span>
            <span className="font-extrabold text-foreground block">
              {PersianNumberFormatter.formatCompactNumber(province.population)}{" "}
              نفر
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <Globe2 size={11} className="text-primary" />
              موقعیت اقلیمی:
            </span>
            <span
              className={`font-bold text-xs ${province.hasSeaAccess ? "text-cyan-400" : "text-amber-400"}`}
            >
              {province.hasSeaAccess ? "ساحلی (۵x)" : "خشکی (۳x)"}
            </span>
          </div>

          <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <TrendingUp size={11} className="text-gdp" />
              بازگشت سرمایه:
            </span>
            <span className="font-extrabold text-gdp text-xs block">
              ~
              {PersianNumberFormatter.toPersianDigits(
                evaluation.estimatedRoiTurns,
              )}{" "}
              نوبت
            </span>
          </div>
        </div>

        <div className="bg-background/60 border border-border/70 p-4 rounded-3xl space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-[11px] font-bold text-foreground font-sans flex items-center gap-1.5">
              <Coins size={14} className="text-gdp" />
              مبلغ نهایی معاهده واگذاری:
            </span>
            <span className="font-black text-sm text-gdp font-mono">
              {PersianNumberFormatter.formatCurrency(evaluation.cost)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans">
            <span>موجودی فعلی خزانه شما:</span>
            <span className="font-bold text-foreground font-mono">
              {PersianNumberFormatter.formatCurrency(humanNation.treasury)}
            </span>
          </div>

          {province.hasSeaAccess && (
            <div className="p-2.5 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-[10px] text-cyan-300 flex items-center gap-2 font-sans">
              <Anchor size={14} className="shrink-0 text-cyan-400" />
              <span>
                این استان دارای دسترسی مستقیم به آب‌های آزاد است (افزایش ترانزیت
                جهانی به ۱۰۰٪ و گشایش ناوگان دریایی).
              </span>
            </div>
          )}
        </div>

        {!evaluation.canBuy && evaluation.reason && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-400 font-sans">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{evaluation.reason}</span>
          </div>
        )}

        <button
          onClick={handleBuy}
          disabled={!evaluation.canBuy || isSubmitting}
          className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xl shadow-gdp/20 flex items-center justify-center gap-2 hover:scale-[1.005] active:scale-[0.995]"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>
            {isSubmitting
              ? "در حال ثبت سند واگذاری قلمرو..."
              : evaluation.canBuy
                ? `امضای معاهده و خرید استان ${province.nameFa} (${PersianNumberFormatter.formatCurrency(evaluation.cost, true)})`
                : "عدم احراز شرایط خرید استان"}
          </span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
