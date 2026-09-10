"use client";

import React, { useState } from "react";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { AmountActionDialog } from "@/presentation/components/common/amount-action-dialog";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { DebtCalculatorUtility } from "@geopolitics/domain";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface ImfLoanCardProps {
  nationId: string;
  nationalDebt?: number;
  gdp?: number;
  treasury?: number;
}

export function ImfLoanCard({
  nationId,
  nationalDebt = 0,
  gdp = 450000000000,
  treasury = 100000,
}: ImfLoanCardProps) {
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const { dispatchAction } = useGameActions();

  const availableLoan = DebtCalculatorUtility.getAvailableLoanHeadroom(
    nationalDebt,
    gdp,
  );

  const availableLoanBillion =
    DebtCalculatorUtility.toBillionUnits(availableLoan);
  const maxRepayBillion = DebtCalculatorUtility.toBillionUnits(
    Math.min(nationalDebt, treasury),
  );

  const isSmallDebt = nationalDebt > 0 && nationalDebt < 1e9;
  const canAffordFullRepay = treasury >= nationalDebt && nationalDebt > 0;

  const handleConfirmLoan = async (billionAmount: number) => {
    const absoluteVal = DebtCalculatorUtility.fromBillionUnits(billionAmount);
    const action = ActionFactory.requestLoan(nationId, absoluteVal);
    await dispatchAction(action);
  };

  const handleConfirmRepay = async (billionAmount: number) => {
    const absoluteVal = DebtCalculatorUtility.fromBillionUnits(billionAmount);
    const action = ActionFactory.repayDebt(nationId, absoluteVal);
    await dispatchAction(action);
  };

  const handleRepayFull = async () => {
    if (!canAffordFullRepay) return;
    const action = ActionFactory.repayDebt(nationId, nationalDebt);
    await dispatchAction(action);
  };

  return (
    <>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Landmark size={13} className="text-treasury" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            صندوق بین‌المللی پول (IMF) و وام‌ها
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground font-sans">
              اعتبار وام آزاد دستی (حداکثر ۳۰٪ GDP):
            </span>
            <span className="font-bold text-gdp">
              {PersianNumberFormatter.formatCurrency(availableLoan)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
              <span className="text-muted-foreground block font-sans">
                کل وام‌های معوق
              </span>
              <span className="font-bold text-military block">
                {PersianNumberFormatter.formatCurrency(nationalDebt)}
              </span>
            </div>

            <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
              <span className="text-muted-foreground block font-sans">
                بهره نوبتی (۱۰٪)
              </span>
              <span className="font-bold text-treasury block">
                {PersianNumberFormatter.formatCurrency(
                  DebtCalculatorUtility.calculateInterest(nationalDebt),
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                TacticalSound.playUiClick();
                setIsLoanModalOpen(true);
              }}
              disabled={availableLoanBillion <= 0}
              className="py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUpRight size={13} className="text-gdp" />
              <span>درخواست وام</span>
            </button>

            {isSmallDebt ? (
              <button
                onClick={handleRepayFull}
                disabled={!canAffordFullRepay}
                className="py-2.5 bg-gdp hover:bg-gdp/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-xl text-xs font-bold transition-all border border-gdp/30 flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <DollarSign size={13} />
                <span>
                  {canAffordFullRepay
                    ? "تسویه کامل بدهی"
                    : "موجودی ناکافی جهت تسویه"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  TacticalSound.playUiClick();
                  setIsRepayModalOpen(true);
                }}
                disabled={
                  nationalDebt <= 0 || treasury <= 0 || maxRepayBillion <= 0
                }
                className="py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowDownRight size={13} className="text-military" />
                <span>تسویه بدهی</span>
              </button>
            )}
          </div>

          {isSmallDebt && !canAffordFullRepay && (
            <div className="text-[10px] text-military font-sans bg-military/10 p-2 rounded-xl border border-military/30 text-center">
              موجودی خزانه کمتر از اصل بدهی معوق (
              {PersianNumberFormatter.formatCurrency(nationalDebt)}) است.
            </div>
          )}
        </div>
      </div>

      <AmountActionDialog
        isOpen={isLoanModalOpen}
        title="دریافت تسهیلات اضطراری از بانک جهانی"
        subtitle="پرداخت نوبتی ۱۰٪ بهره بر اصل وام دریافتی از صندوق بین‌المللی پول"
        unitLabel="میلیارد دلار"
        maxAmount={availableLoanBillion}
        confirmLabel="دریافت وام"
        colorVariant="gdp"
        icon={ArrowUpRight}
        emptyStateText="سقف اعتبار ملی (۳۰٪ GDP) تکمیل است."
        onClose={() => setIsLoanModalOpen(false)}
        onConfirm={handleConfirmLoan}
      />

      <AmountActionDialog
        isOpen={isRepayModalOpen}
        title="تسویه بدهی معوق ملی"
        subtitle="پرداخت بخشی از بدهی به بانک جهانی از محل موجودی خزانه"
        unitLabel="میلیارد دلار"
        maxAmount={maxRepayBillion}
        confirmLabel="تسویه بدهی"
        colorVariant="military"
        icon={ArrowDownRight}
        emptyStateText="امکان تسویه وجود ندارد."
        onClose={() => setIsRepayModalOpen(false)}
        onConfirm={handleConfirmRepay}
      />
    </>
  );
}
