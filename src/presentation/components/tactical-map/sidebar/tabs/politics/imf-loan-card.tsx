import React from "react";
import { Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

interface ImfLoanCardProps {
  nationId?: string;
  nationalDebt?: number;
  gdp?: number;
  treasury?: number;
}

export function ImfLoanCard({
  nationId = "NATION_118",
  nationalDebt = 0,
  gdp = 450000000000,
  treasury = 100000,
}: ImfLoanCardProps) {
  const debtToGdpRatio = gdp > 0 ? nationalDebt / gdp : 0;
  const creditRating = Math.max(
    0,
    Math.min(100, Math.floor(100 - debtToGdpRatio * 200)),
  );
  const { dispatchAction } = useGameActions();

  const maxCreditLimit = Math.floor(gdp * 0.2 * (creditRating / 100));
  const availableLoan = Math.max(0, maxCreditLimit - nationalDebt);

  const handleRequestLoan = async () => {
    if (availableLoan < 10000) return;
    const amountToRequest = Math.min(50000, availableLoan);

    const action = ActionFactory.requestLoan(nationId, amountToRequest);
    await dispatchAction(
      action,
      `وام اضطراری $${amountToRequest.toLocaleString("fa-IR")} به خزانه ملی واریز شد.`,
    );
  };

  const handleRepayDebt = async () => {
    if (nationalDebt <= 0 || treasury <= 0) return;
    const amountToRepay = Math.min(25000, nationalDebt, treasury);

    const action = ActionFactory.repayDebt(nationId, amountToRepay);
    await dispatchAction(
      action,
      `مبلغ $${amountToRepay.toLocaleString("fa-IR")} از بدهی ملی تسویه گردید.`,
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={13} className="text-treasury" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          بانک جهانی و تسهیلات اعتباری
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            رتبه اعتبار ملی:
          </span>
          <span className="font-bold text-gdp">{creditRating} / ۱۰۰</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
            <span className="text-muted-foreground block font-sans">
              بدهی معوق فعلی
            </span>
            <span className="font-bold text-military block">
              ${nationalDebt.toLocaleString("fa-IR")}
            </span>
          </div>

          <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
            <span className="text-muted-foreground block font-sans">
              اعتبار وام آزاد
            </span>
            <span className="font-bold text-gdp block">
              ${availableLoan.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleRequestLoan}
            disabled={availableLoan < 10000}
            className="py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowUpRight size={13} className="text-gdp" />
            <span>وام اضطراری</span>
          </button>

          <button
            onClick={handleRepayDebt}
            disabled={nationalDebt <= 0 || treasury <= 0}
            className="py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowDownRight size={13} className="text-military" />
            <span>تسویه بدهی</span>
          </button>
        </div>
      </div>
    </div>
  );
}
