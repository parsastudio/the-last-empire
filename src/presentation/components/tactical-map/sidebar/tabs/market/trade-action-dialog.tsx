import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

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
  nationId = "NATION_118",
  onClose,
  onConfirm,
}: TradeActionDialogProps) {
  const [amount, setAmount] = useState<number>(10);
  const { dispatchAction } = useGameActions();

  if (!isOpen) return null;

  const totalCost = amount * unitPrice;
  const fee = Math.floor(totalCost * 0.1);
  const finalTotal = mode === "buy" ? totalCost + fee : totalCost - fee;

  const handleExecuteTrade = async () => {
    const resType = resourceName.includes("نفت") ? "oil" : "steel";
    const isBuy = mode === "buy";

    const success = await dispatchAction(
      {
        id: `trade-${Date.now()}`,
        nationId,
        type: "TRADE_RESOURCES",
        resourceType: resType,
        isBuy,
        amount,
      },
      `سفارش ${isBuy ? "خرید" : "فروش"} ${amount} ${unit} ${resourceName} اجرا شد.`,
    );

    if (success) {
      onConfirm(amount);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`${mode === "buy" ? "خرید" : "فروش"} ${resourceName}`}
      subtitle="ثبت سفارش معامله کالا در بورس جهانی"
      maxWidthClass="max-w-sm"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl">
        <div className="space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground font-sans">
                حجم سفارش ({unit}):
              </span>
              <span className="font-bold text-foreground">{amount}</span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.max(1, maxAmount)}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg"
            />
          </div>

          <div className="bg-secondary/40 p-3 rounded-2xl space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">
                قیمت پایه:
              </span>
              <span>${totalCost.toLocaleString("fa-IR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">
                کارمزد معامله (۱۰٪):
              </span>
              <span>${fee.toLocaleString("fa-IR")}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-border/40 pt-1 text-xs">
              <span className="font-sans">
                {mode === "buy" ? "پرداختی نهایی:" : "دریافتی خالص:"}
              </span>
              <span className="text-gdp">
                ${finalTotal.toLocaleString("fa-IR")}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExecuteTrade}
          className="w-full py-3 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <ShoppingBag size={14} />
          <span>تایید و اجرای معامله</span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
