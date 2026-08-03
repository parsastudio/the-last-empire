import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface LoanActionDialogProps {
  isOpen: boolean;
  maxAvailableLoan: number;
  nationId: string;
  onClose: () => void;
}

export function LoanActionDialog({
  isOpen,
  maxAvailableLoan,
  nationId,
  onClose,
}: LoanActionDialogProps) {
  const safeMax = Math.max(0, maxAvailableLoan);
  const maxBillion = Math.floor(safeMax / 1e9);
  const [billionAmount, setBillionAmount] = useState<number>(1);
  const [prevKey, setPrevKey] = useState<string>("");

  const currentKey = `${isOpen}-${safeMax}`;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (isOpen) {
      if (maxBillion <= 0) {
        setBillionAmount(0);
      } else {
        setBillionAmount(
          Math.min(maxBillion, Math.max(1, Math.floor(maxBillion * 0.25))),
        );
      }
    }
  }

  const { dispatchAction } = useGameActions();
  const currentBillion = Math.max(0, Math.min(billionAmount, maxBillion));
  const absoluteValue = currentBillion * 1e9;

  const handlePercentageSelect = (pct: number) => {
    if (maxBillion <= 0) return;
    const target = Math.max(1, Math.floor(maxBillion * pct));
    setBillionAmount(target);
  };

  const handleExecuteLoan = async () => {
    if (absoluteValue <= 0) return;

    const action = ActionFactory.requestLoan(nationId, absoluteValue);
    const success = await dispatchAction(
      action,
      `وام اضطراری به مبلغ ${PersianNumberFormatter.formatCurrency(absoluteValue)} به خزانه ملی واریز گردید.`,
    );

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="دریافت تسهیلات اضطراری از بانک جهانی"
      subtitle="پرداخت نوبتی ۵٪ بهره بر اصل وام دریافتی از صندوق بین‌المللی پول"
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl">
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px]">
              حداکثر سقف اعتبار وام قابل دریافت:
            </span>
            <span className="font-bold text-gdp font-mono text-xs">
              {PersianNumberFormatter.formatCurrency(safeMax)}
            </span>
          </div>

          <div className="space-y-2 bg-background/40 p-3.5 rounded-2xl border border-border/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-sans">
                مبلغ وام درخواستی (میلیارد دلار):
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
              className="w-full cursor-pointer h-2 bg-secondary rounded-lg accent-emerald-500 disabled:opacity-30"
            />

            <PercentageSelector
              disabled={maxBillion === 0}
              onSelect={handlePercentageSelect}
              colorVariant="gdp"
            />
          </div>

          <div className="bg-secondary/40 p-3.5 rounded-2xl space-y-2 text-[11px] border border-border/60 font-sans">
            <div className="flex justify-between items-center font-mono">
              <span className="text-muted-foreground">
                بهره نوبتی کسرشده از خزانه (۵٪):
              </span>
              <span className="font-bold text-treasury">
                {PersianNumberFormatter.formatCurrency(absoluteValue * 0.05)} /
                نوبت
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExecuteLoan}
          disabled={maxBillion === 0 || absoluteValue <= 0}
          className="w-full py-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-gdp/10 flex items-center justify-center gap-2"
        >
          <ArrowUpRight size={15} />
          <span>
            {maxBillion === 0
              ? "سقف اعتبار ملی تکمیل است"
              : `دریافت وام به مبلغ ${PersianNumberFormatter.toPersianDigits(currentBillion)} میلیارد دلار`}
          </span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
