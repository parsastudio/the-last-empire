import React from "react";
import { Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";

interface ImfLoanCardProps {
  nationId?: string;
  nationalDebt?: number;
  gdp?: number;
}

export function ImfLoanCard({
  nationId = "NATION_118",
  nationalDebt = 0,
  gdp = 450000000000,
}: ImfLoanCardProps) {
  const debtToGdpRatio = gdp > 0 ? nationalDebt / gdp : 0;
  const creditRating = Math.max(
    0,
    Math.min(100, Math.floor(100 - debtToGdpRatio * 200)),
  );
  const { dispatchAction } = useGameActions();

  const handleRequestLoan = async () => {
    await dispatchAction(
      {
        id: `loan-${Date.now()}`,
        nationId,
        type: "REQUEST_LOAN",
        amount: 50000,
      },
      "وام اضطراری $۵۰,۰۰۰ به خزانه ملی واریز شد.",
    );
  };

  const handleRepayDebt = async () => {
    if (nationalDebt <= 0) {
      return;
    }
    const amountToRepay = Math.min(25000, nationalDebt);
    await dispatchAction(
      {
        id: `repay-${Date.now()}`,
        nationId,
        type: "REPAY_DEBT",
        amount: amountToRepay,
      },
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
              نرخ سود سالانه
            </span>
            <span className="font-bold text-foreground block">۵.۰٪</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleRequestLoan}
            className="py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowUpRight size={13} className="text-gdp" />
            <span>وام اضطراری</span>
          </button>

          <button
            onClick={handleRepayDebt}
            disabled={nationalDebt <= 0}
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
