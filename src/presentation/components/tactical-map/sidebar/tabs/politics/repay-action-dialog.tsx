import React, { useState, useEffect } from "react";
import { ArrowDownRight } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface RepayActionDialogProps {
  isOpen: boolean;
  nationalDebt: number;
  userTreasury: number;
  nationId: string;
  onClose: () => void;
}

export function RepayActionDialog({
  isOpen,
  nationalDebt,
  userTreasury,
  nationId,
  onClose,
}: RepayActionDialogProps) {
  const maxRepayable = Math.min(nationalDebt, userTreasury);
  const maxBillion = Math.floor(maxRepayable / 1e9);
  const [billionAmount, setBillionAmount] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;
    if (maxBillion <= 0) {
      setBillionAmount(0);
    } else {
      setBillionAmount(
        Math.min(maxBillion, Math.max(1, Math.floor(maxBillion * 0.25))),
      );
    }
  }, [isOpen, maxBillion]);

  const { dispatchAction } = useGameActions();
  const currentBillion = Math.max(0, Math.min(billionAmount, maxBillion));
  const absoluteValue = currentBillion * 1e9;

  const handlePercentageSelect = (pct: number) => {
    if (maxBillion <= 0) return;
    const target = Math.max(1, Math.floor(maxBillion * pct));
    setBillionAmount(target);
  };

  const handleExecuteRepay = async () => {
    if (absoluteValue <= 0) return;

    const action = ActionFactory.repayDebt(nationId, absoluteValue);
    const success = await dispatchAction(
      action,
      `مبلغ ${PersianNumberFormatter.formatCurrency(absoluteValue)} از بدهی ملی با موفقیت تسویه گردید.`,
    );

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="تسویه بدهی معوق ملی"
      subtitle="پرداخت بخشی از بدهی به بانک جهانی از محل موجودی خزانه"
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl">
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/40 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[10px]">
                کل بدهی ملی:
              </span>
              <span className="font-bold text-military">
                {PersianNumberFormatter.formatCurrency(nationalDebt)}
              </span>
            </div>
            <div className="bg-secondary/40 p-2.5 rounded-xl border border-border/40">
              <span className="text-muted-foreground block font-sans text-[10px]">
                موجودی خزانه:
              </span>
              <span className="font-bold text-gdp">
                {PersianNumberFormatter.formatCurrency(userTreasury)}
              </span>
            </div>
          </div>

          <div className="space-y-2 bg-background/40 p-3.5 rounded-2xl border border-border/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-sans">
                مبلغ تسویه درخواستی (میلیارد دلار):
              </span>
              <span className="font-bold text-foreground text-sm font-mono">
                {PersianNumberFormatter.toPersianDigits(currentBillion)} میلیارد
                دلار
              </span>
            </div>

            <input
              type="range"
              min={maxBillion > 0 ? 1 : 0}
              max={Math.max(0, maxBillion)}
              disabled={maxBillion === 0}
              value={currentBillion}
              onChange={(e) => setBillionAmount(Number(e.target.value))}
              className="w-full cursor-pointer h-2 bg-secondary rounded-lg accent-rose-600 disabled:opacity-30"
            />

            <PercentageSelector
              disabled={maxBillion === 0}
              onSelect={handlePercentageSelect}
              colorVariant="military"
            />
          </div>
        </div>

        <button
          onClick={handleExecuteRepay}
          disabled={maxBillion === 0 || absoluteValue <= 0}
          className="w-full py-3.5 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-military/10 flex items-center justify-center gap-2"
        >
          <ArrowDownRight size={15} />
          <span>
            {maxBillion === 0
              ? "امکان تسویه وجود ندارد (بدهی صفر یا خزانه خالی)"
              : `تسویه مبلغ ${PersianNumberFormatter.toPersianDigits(currentBillion)} میلیارد دلار از بدهی`}
          </span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
