import React, { useState } from "react";
import { Cpu, Zap, AlertTriangle, Clock } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ResearchBudgetCardProps {
  nationId: string;
  gdp?: number;
  treasury?: number;
  currentBudgetRate?: number;
  accumulatedCost?: number;
  cycleTurn?: number;
  industrialLevel?: number;
}

export function ResearchBudgetCard({
  nationId,
  gdp = 450000000000,
  treasury = 100000000,
  currentBudgetRate = 1,
  accumulatedCost = 0,
  cycleTurn = 0,
  industrialLevel = 1,
}: ResearchBudgetCardProps) {
  const [budgetRate, setBudgetRate] = useState<number>(currentBudgetRate);
  const [prevRate, setPrevRate] = useState<number>(currentBudgetRate);
  const { dispatchAction } = useGameActions();

  if (currentBudgetRate !== prevRate) {
    setPrevRate(currentBudgetRate);
    setBudgetRate(currentBudgetRate);
  }

  const projectedTurnCost = Math.floor(gdp * (budgetRate / 100));
  const isRateChanged = budgetRate !== currentBudgetRate;
  const isMidCycle = cycleTurn > 0;
  const isDeficitWarning = treasury < projectedTurnCost;

  const industrialBonusPercent = (industrialLevel - 1) * 10;

  const handleApplyBudget = async () => {
    const action = ActionFactory.setResearchBudget(nationId, budgetRate);
    await dispatchAction(
      action,
      `بودجه پژوهش و توسعه روی ${PersianNumberFormatter.toPersianDigits(budgetRate)}٪ از GDP تنظیم گردید.`,
    );
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Cpu size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تنظیم بودجه پژوهش و توسعه استراتژیک (R&D)
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-extrabold text-primary text-sm">
            {PersianNumberFormatter.toPersianDigits(budgetRate)}٪ از GDP
          </span>
          <span className="text-muted-foreground">نرخ بودجه پژوهشی نوبتی</span>
        </div>

        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={budgetRate}
          onChange={(e) => setBudgetRate(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <div className="grid grid-cols-4 gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setBudgetRate(0)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              budgetRate === 0
                ? "bg-secondary text-foreground border-border"
                : "bg-secondary/40 hover:bg-secondary border-border/40 text-muted-foreground"
            }`}
          >
            توقف (۰٪)
          </button>
          <button
            type="button"
            onClick={() => setBudgetRate(5)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              budgetRate === 5
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 hover:bg-secondary border-border/40 text-muted-foreground"
            }`}
          >
            عادی (۵٪)
          </button>
          <button
            type="button"
            onClick={() => setBudgetRate(15)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              budgetRate === 15
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 hover:bg-secondary border-border/40 text-muted-foreground"
            }`}
          >
            پیشرفته (۱۵٪)
          </button>
          <button
            type="button"
            onClick={() => setBudgetRate(30)}
            className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-pointer ${
              budgetRate === 30
                ? "bg-rose-600 text-white border-rose-500"
                : "bg-secondary/40 hover:bg-secondary border-border/40 text-rose-500"
            }`}
          >
            حداکثر (۳۰٪)
          </button>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px]">
              هزینه کسرشده از خزانه در هر نوبت:
            </span>
            <span className="font-bold text-foreground">
              {PersianNumberFormatter.formatCurrency(projectedTurnCost)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
            <span className="text-muted-foreground font-sans flex items-center gap-1">
              <Clock size={12} className="text-treasury" />
              وضعیت چرخه ۳ نوبته پژوهش:
            </span>
            <span className="font-bold text-amber-500 font-mono">
              نوبت {PersianNumberFormatter.toPersianDigits(cycleTurn)} از ۳
            </span>
          </div>

          <div className="w-full bg-background/80 h-2 rounded-full overflow-hidden border border-border/40">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(cycleTurn / 3) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
            <span>انباشت فعلی چرخه:</span>
            <span className="font-bold text-gdp font-mono">
              {PersianNumberFormatter.formatCurrency(accumulatedCost)}
            </span>
          </div>

          {industrialBonusPercent > 0 && (
            <div className="text-[10px] text-gdp font-sans pt-1 border-t border-border/30">
              • پاداش کارایی صنعت (سطح{" "}
              {PersianNumberFormatter.toPersianDigits(industrialLevel)}): +
              {PersianNumberFormatter.toPersianDigits(industrialBonusPercent)}٪
              امتیاز بیشتر
            </div>
          )}
        </div>

        {isMidCycle && isRateChanged && (
          <div className="p-3 bg-military/10 border border-military/30 rounded-xl flex items-center gap-2 text-[10px] text-military font-sans">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              هشدار: تغییر نرخ بودجه در طول چرخه، پیشرفت نوبت‌های قبلی این چرخه
              را صفر کرده و تایمر از ۱ شروع می‌شود.
            </span>
          </div>
        )}

        {isDeficitWarning && budgetRate > 0 && (
          <div className="p-3 bg-treasury/10 border border-treasury/30 rounded-xl flex items-center gap-2 text-[10px] text-treasury font-sans">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              توجه: هزینه نوبتی از موجودی فعلی خزانه بیشتر است و مابقی به بدهی
              ملی (وام) تبدیل خواهد شد.
            </span>
          </div>
        )}

        <button
          onClick={handleApplyBudget}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Zap size={14} />
          <span>
            ثبت و اعمال بودجه پژوهشی (
            {PersianNumberFormatter.toPersianDigits(budgetRate)}٪)
          </span>
        </button>
      </div>
    </div>
  );
}
