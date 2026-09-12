"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { AmountActionDialog } from "@/presentation/components/common/amount-action-dialog";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { DebtCalculatorUtility } from "@geopolitics/domain";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const t = useTranslations("overview.imf");
  const { formatCurrency } = useLocaleFormatter();
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
      <div className="space-y-2.5 text-start font-sans">
        <div className="flex items-center gap-2 px-1">
          <Landmark size={13} className="text-treasury" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            {t("title")}
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground font-sans">
              {t("availableCredit")}
            </span>
            <span className="font-bold text-gdp">
              {formatCurrency(availableLoan)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
              <span className="text-muted-foreground block font-sans">
                {t("overdueLoans")}
              </span>
              <span className="font-bold text-military block">
                {formatCurrency(nationalDebt)}
              </span>
            </div>

            <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
              <span className="text-muted-foreground block font-sans">
                {t("turnInterest")}
              </span>
              <span className="font-bold text-treasury block">
                {formatCurrency(
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
              <span>{t("requestLoan")}</span>
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
                    ? t("repayFull")
                    : t("insufficientToSettle")}
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
                <span>{t("repayDebt")}</span>
              </button>
            )}
          </div>

          {isSmallDebt && !canAffordFullRepay && (
            <div className="text-[10px] text-military font-sans bg-military/10 p-2 rounded-xl border border-military/30 text-center">
              {t("smallDebtWarning", {
                amount: formatCurrency(nationalDebt),
              })}
            </div>
          )}
        </div>
      </div>

      <AmountActionDialog
        isOpen={isLoanModalOpen}
        title={t("loanDialogTitle")}
        subtitle={t("loanDialogSubtitle")}
        unitLabel={t("billionDollars")}
        maxAmount={availableLoanBillion}
        confirmLabel={t("requestLoan")}
        colorVariant="gdp"
        icon={ArrowUpRight}
        emptyStateText={t("maxCreditFull")}
        onClose={() => setIsLoanModalOpen(false)}
        onConfirm={handleConfirmLoan}
      />

      <AmountActionDialog
        isOpen={isRepayModalOpen}
        title={t("repayDialogTitle")}
        subtitle={t("repayDialogSubtitle")}
        unitLabel={t("billionDollars")}
        maxAmount={maxRepayBillion}
        confirmLabel={t("repayDebt")}
        colorVariant="military"
        icon={ArrowDownRight}
        emptyStateText={t("cannotRepay")}
        onClose={() => setIsRepayModalOpen(false)}
        onConfirm={handleConfirmRepay}
      />
    </>
  );
}
