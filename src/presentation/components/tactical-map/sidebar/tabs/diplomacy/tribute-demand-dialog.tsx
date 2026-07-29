import React, { useState } from "react";
import { X, Coins } from "lucide-react";
import { TributeSliderBox } from "./tribute-slider-box";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

interface TributeDemandDialogProps {
  isOpen: boolean;
  targetName: string;
  targetTreasury: number;
  targetNationId?: string;
  nationId?: string;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function TributeDemandDialog({
  isOpen,
  targetName,
  targetTreasury,
  targetNationId = "NATION_15",
  nationId = "NATION_118",
  onClose,
  onConfirm,
}: TributeDemandDialogProps) {
  const maxAllowed = Math.max(1000, Math.floor(targetTreasury * 0.1));
  const [amount, setAmount] = useState<number>(
    Math.max(1000, Math.floor(maxAllowed * 0.5)),
  );
  const { dispatchAction } = useGameActions();

  if (!isOpen) return null;

  const handleSendTribute = async () => {
    const action = ActionFactory.diplomaticProposal(
      nationId,
      targetNationId,
      "DEMAND_TRIBUTE",
      amount,
    );

    const success = await dispatchAction(
      action,
      `اولتیماتوم دریافت $${amount.toLocaleString("fa-IR")} باج به ${targetName} ابلاغ گردید.`,
    );

    if (success) {
      onConfirm(amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 text-right shadow-2xl relative dir-rtl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl cursor-pointer"
        >
          <X size={14} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 font-mono">
            <Coins size={14} />
            <span>مطالبه باج و باج‌گیری اقتصادی</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            تنظیم مبلغ باج سالانه از {targetName}
          </h3>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          حداکثر سقف مجاز باج طبق قوانین بین‌المللی برابر ۱۰٪ از کل موجودی خزانه
          هدف (${maxAllowed.toLocaleString("fa-IR")}) می‌باشد.
        </p>

        <TributeSliderBox
          amount={amount}
          maxAmount={maxAllowed}
          onChangeAmount={setAmount}
        />

        <button
          onClick={handleSendTribute}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-primary-foreground rounded-2xl font-bold text-xs cursor-pointer shadow-md"
        >
          ارسال اولتیماتوم و دریافت باج
        </button>
      </div>
    </div>
  );
}
