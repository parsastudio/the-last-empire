import React, { useState, useEffect } from "react";
import { ShoppingBag, TrendingDown } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";
import { MARKET_CONFIG } from "@/domain/economy/market.config";

interface TradeActionDialogProps {
  isOpen: boolean;
  resourceName: string;
  unit: string;
  mode: "buy" | "sell";
  unitPrice: number;
  maxAmount: number;
  nationId?: string;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function TradeActionDialog({
  isOpen,
  resourceName,
  unit,
  mode,
  unitPrice,
  maxAmount,
  nationId,
  onClose,
  onConfirm,
}: TradeActionDialogProps) {
  const safeMax = Math.max(0, maxAmount);
  const [amount, setAmount] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;
    if (safeMax <= 0) {
      setAmount(0);
    } else {
      const defaultInitial = Math.min(
        safeMax,
        Math.max(1, Math.floor(safeMax * 0.25)),
      );
      setAmount(defaultInitial);
    }
  }, [isOpen, safeMax, mode, resourceName]);

  const { dispatchAction } = useGameActions();

  const currentAmount = Math.max(0, Math.min(amount, safeMax));
  const isOil = resourceName.includes("نفت");
  const resourceType = isOil ? "oil" : "steel";
  const buyUnitPrice = unitPrice || MARKET_CONFIG.FIXED_BUY_PRICE;
  const sellUnitPrice = MARKET_CONFIG.FIXED_SELL_PRICE;
  const effectiveUnitPrice = mode === "buy" ? buyUnitPrice : sellUnitPrice;

  const totalCostOrRevenue = currentAmount * effectiveUnitPrice;
  const subLabel = isOil
    ? "(معادل ۱۰ میلیون بشکه نفت)"
    : "(معادل ۱ میلیون تن فولاد)";

  if (!isOpen || !nationId) return null;

  const isBuy = mode === "buy";

  const handleExecuteTrade = async () => {
    if (currentAmount <= 0) return;

    const action = ActionFactory.tradeResources(
      nationId,
      resourceType,
      isBuy,
      currentAmount,
    );

    const success = await dispatchAction(
      action,
      `سفارش ${isBuy ? "خرید" : "فروش"} ${PersianNumberFormatter.toPersianDigits(currentAmount)} ${unit} ${resourceName} با موفقیت ثبت شد.`,
    );

    if (success) {
      onConfirm(currentAmount);
    }
  };

  const handlePercentageSelect = (pct: number) => {
    if (safeMax <= 0) return;
    const target = Math.max(1, Math.floor(safeMax * pct));
    setAmount(target);
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`${isBuy ? "خرید" : "فروش"} ${resourceName}`}
      subtitle={`معامله بورس کلان | ${subLabel}`}
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl">
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px]">
              {isBuy
                ? "حداکثر سقف خرید با خزانه فعلی:"
                : "موجودی قابل فروش در انبار:"}
            </span>
            <span
              className={`font-bold font-mono text-xs ${isBuy ? "text-gdp" : "text-rose-500"}`}
            >
              {PersianNumberFormatter.toPersianDigits(
                safeMax.toLocaleString("en-US"),
              )}{" "}
              {unit}
            </span>
          </div>

          <div className="space-y-1 bg-background/40 p-3 rounded-2xl border border-border/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-sans">
                تعداد بلوک‌های درخواستی:
              </span>
              <span className="font-bold text-foreground text-sm font-mono">
                {PersianNumberFormatter.toPersianDigits(
                  currentAmount.toLocaleString("en-US"),
                )}{" "}
                {unit}
              </span>
            </div>

            <input
              type="range"
              min={safeMax > 0 ? 1 : 0}
              max={Math.max(0, safeMax)}
              disabled={safeMax === 0}
              value={currentAmount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={`w-full cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30 ${
                isBuy ? "accent-emerald-500" : "accent-rose-600"
              }`}
            />

            <PercentageSelector
              disabled={safeMax === 0}
              onSelect={handlePercentageSelect}
              colorVariant={isBuy ? "gdp" : "military"}
            />
          </div>

          <div className="bg-secondary/40 p-3.5 rounded-2xl space-y-2 text-[11px] border border-border/60">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-sans">
                قیمت هر بلوک استراتژیک ({isBuy ? "خرید ۲۵M" : "فروش ۲۰M"}):
              </span>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.formatCurrency(effectiveUnitPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center font-bold border-t border-border/60 pt-2 text-xs">
              <span className="font-sans">
                {isBuy ? "پرداختی کل از خزانه:" : "دریافتی کل به خزانه:"}
              </span>
              <span
                className={`text-sm ${isBuy ? "text-rose-500" : "text-gdp"}`}
              >
                {PersianNumberFormatter.formatCurrency(totalCostOrRevenue)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExecuteTrade}
          disabled={safeMax === 0 || currentAmount <= 0}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none ${
            isBuy
              ? "bg-gdp hover:bg-gdp/90 text-primary-foreground shadow-gdp/10"
              : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
          }`}
        >
          {isBuy ? <ShoppingBag size={15} /> : <TrendingDown size={15} />}
          <span>
            {safeMax === 0
              ? isBuy
                ? "خزانه ناکافی جهت معامله"
                : "هیچ بلوک استراتژیکی برای فروش در انبار وجود ندارد"
              : isBuy
                ? `تایید و خرید ${PersianNumberFormatter.toPersianDigits(currentAmount)} ${unit}`
                : `تایید و فروش ${PersianNumberFormatter.toPersianDigits(currentAmount)} ${unit}`}
          </span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
