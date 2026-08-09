import React from "react";
import { ShoppingBag, TrendingDown } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { MARKET_CONFIG } from "@/domain/economy/market.config";
import { AmountActionDialog } from "@/presentation/components/common/amount-action-dialog";

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
  const { dispatchAction } = useGameActions();

  if (!isOpen || !nationId) return null;

  const isBuy = mode === "buy";
  const resourceType = "oil";
  const effectiveUnitPrice =
    mode === "buy"
      ? unitPrice || MARKET_CONFIG.FIXED_BUY_PRICE
      : MARKET_CONFIG.FIXED_SELL_PRICE;

  const handleExecuteTrade = async (currentAmount: number) => {
    if (currentAmount <= 0) return;

    const action = ActionFactory.tradeResources(
      nationId,
      resourceType,
      isBuy,
      currentAmount,
    );

    const success = await dispatchAction(
      action,
      `سفارش ${isBuy ? "خرید" : "فروش"} ${PersianNumberFormatter.toPersianDigits(currentAmount)} ${unit} ${resourceName} ثبت شد.`,
    );

    if (success) {
      onConfirm(currentAmount);
    }
  };

  const subLabel = "(معادل ۱۰ میلیون بشکه نفت)";

  return (
    <AmountActionDialog
      isOpen={isOpen}
      title={`${isBuy ? "خرید" : "فروش"} ${resourceName}`}
      subtitle={`معامله بورس کلان | ${subLabel}`}
      unitLabel={unit}
      maxAmount={maxAmount}
      confirmLabel={isBuy ? "تایید و خرید" : "تایید و فروش"}
      colorVariant={isBuy ? "gdp" : "military"}
      icon={isBuy ? ShoppingBag : TrendingDown}
      emptyStateText={
        isBuy
          ? "خزانه ناکافی جهت معامله"
          : "هیچ بلوک استراتژیکی برای فروش در انبار وجود ندارد"
      }
      infoRows={[
        {
          label: `قیمت هر بلوک (${isBuy ? "خرید ۲۵M" : "فروش ۲۰M"}):`,
          value: PersianNumberFormatter.formatCurrency(effectiveUnitPrice),
        },
      ]}
      onClose={onClose}
      onConfirm={handleExecuteTrade}
    />
  );
}
