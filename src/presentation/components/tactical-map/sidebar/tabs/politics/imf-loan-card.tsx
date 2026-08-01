import React, { useState } from "react";
import { Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LoanManager } from "@/engine/economy/loan-manager";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { LoanActionDialog } from "./loan-action-dialog";
import { RepayActionDialog } from "./repay-action-dialog";
import { Nation } from "@/domain/nation/nation.schema";

interface ImfLoanCardProps {
  nationId?: string;
  nationalDebt?: number;
  gdp?: number;
  treasury?: number;
  nation?: Nation;
}

export function ImfLoanCard({
  nationId = "NATION_118",
  nationalDebt = 0,
  gdp = 450000000000,
  treasury = 100000,
  nation,
}: ImfLoanCardProps) {
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  const loanManager = new LoanManager();
  const mockNation =
    nation ||
    ({
      gdp,
      nationalDebt,
      treasury,
      government: { stability: 80 },
      activeModifiers: [],
    } as unknown as Nation);

  const creditRating = loanManager.calculateCreditRating(mockNation);
  const maxDebtLimit = Math.floor(gdp * 1.0 * (creditRating / 100));
  const availableLoan = Math.max(0, maxDebtLimit - nationalDebt);

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
              اعتبار وام آزاد:
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
                بهره نوبتی (۵٪)
              </span>
              <span className="font-bold text-treasury block">
                {PersianNumberFormatter.formatCurrency(
                  Math.floor(nationalDebt * 0.05),
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUpRight size={13} className="text-gdp" />
              <span>درخواست وام</span>
            </button>

            <button
              onClick={() => setIsRepayModalOpen(true)}
              disabled={nationalDebt <= 0 || treasury <= 0}
              className="py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowDownRight size={13} className="text-military" />
              <span>تسویه بدهی</span>
            </button>
          </div>
        </div>
      </div>

      <LoanActionDialog
        isOpen={isLoanModalOpen}
        maxAvailableLoan={availableLoan}
        nationId={nationId}
        onClose={() => setIsLoanModalOpen(false)}
      />

      <RepayActionDialog
        isOpen={isRepayModalOpen}
        nationalDebt={nationalDebt}
        userTreasury={treasury}
        nationId={nationId}
        onClose={() => setIsRepayModalOpen(false)}
      />
    </>
  );
}
