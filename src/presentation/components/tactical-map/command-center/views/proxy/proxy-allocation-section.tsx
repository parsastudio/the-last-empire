import React from "react";
import { Search, Zap, Coins, ShieldAlert, Crosshair } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface TargetOption {
  id: string;
  name: string;
  flagCode: string;
  stability: number;
}

interface ProxyAllocationSectionProps {
  searchQuery: string;
  selectedTargetId: string;
  allocatedBudget: number;
  userTreasury: number;
  filteredTargetOptions: TargetOption[];
  selectedTargetNation: TargetOption | null;
  predictedStabilityDrain: number;
  onSearchChange: (query: string) => void;
  onSelectTarget: (id: string) => void;
  onBudgetChange: (budget: number) => void;
  onConfirmAllocation: () => void;
}

export function ProxyAllocationSection({
  searchQuery,
  selectedTargetId,
  allocatedBudget,
  userTreasury,
  filteredTargetOptions,
  selectedTargetNation,
  predictedStabilityDrain,
  onSearchChange,
  onSelectTarget,
  onBudgetChange,
  onConfirmAllocation,
}: ProxyAllocationSectionProps) {
  const maxAffordable = Math.min(100000, userTreasury);

  const handlePercentageClick = (pct: number) => {
    const target = Math.max(5000, Math.floor(userTreasury * pct));
    onBudgetChange(target);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dir-rtl text-right">
      <div className="lg:col-span-5 space-y-3 bg-background/30 p-4 border border-border/60 rounded-3xl">
        <div className="flex items-center gap-2 pb-1">
          <Crosshair size={14} className="text-military" />
          <span className="text-xs font-bold text-foreground">
            انتخاب کشور هدف عملیات
          </span>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجوی نام یا نماد کشور..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right"
          />
        </div>

        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredTargetOptions.map((target) => {
            const isSelected = target.id === selectedTargetId;
            const flag = getFlagEmoji(target.flagCode);
            return (
              <button
                key={target.id}
                onClick={() => onSelectTarget(target.id)}
                className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                  isSelected
                    ? "bg-secondary border-primary font-bold shadow-sm"
                    : "bg-background/40 border-border/60 hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-xl select-none"
                    role="img"
                    aria-label={target.name}
                  >
                    {flag}
                  </span>
                  <span>{target.name}</span>
                </div>
                <span className="font-mono text-[9px] bg-background px-2 py-0.5 rounded text-muted-foreground">
                  ثبات: {target.stability}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-7 space-y-4 bg-background/40 p-5 border border-border/80 rounded-3xl">
        {selectedTargetNation ? (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <span
                  className="text-3xl select-none"
                  role="img"
                  aria-label={selectedTargetNation.name}
                >
                  {getFlagEmoji(selectedTargetNation.flagCode)}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    تخصیص بودجه نفوذ برای {selectedTargetNation.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ثبات سیاسی فعلی: {selectedTargetNation.stability}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-sans">
                  مبلغ بودجه عملیات:
                </span>
                <span className="font-bold text-gdp text-sm flex items-center gap-1">
                  <Coins size={14} />${allocatedBudget.toLocaleString("fa-IR")}
                </span>
              </div>

              <input
                type="range"
                min="5000"
                max={Math.max(5000, maxAffordable)}
                step="5000"
                value={allocatedBudget}
                onChange={(e) => onBudgetChange(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg"
              />

              <div className="grid grid-cols-4 gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => handlePercentageClick(0.1)}
                  className="py-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  ۱۰٪ خزانه
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(0.25)}
                  className="py-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  ۲۵٪ خزانه
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(0.5)}
                  className="py-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  ۵۰٪ خزانه
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(1.0)}
                  className="py-1.5 bg-gdp/20 hover:bg-gdp/30 border border-gdp/40 text-gdp rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  حداکثر
                </button>
              </div>

              <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">
                    پیش‌بینی تخریب ثبات هدف:
                  </span>
                  <span className="font-bold text-military text-sm">
                    -{predictedStabilityDrain}% / نوبت
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-sans">
                    فرسایش نوبتی بودجه (Decay):
                  </span>
                  <span className="text-treasury">۲۵٪ در پایان هر نوبت</span>
                </div>
              </div>

              <div className="p-3 bg-military/10 border border-military/30 rounded-2xl flex items-center gap-2 text-[10px] text-military font-sans">
                <ShieldAlert size={14} className="shrink-0" />
                <span>
                  افت ثبات هدف به زیر ۱۰٪ باعث وقوع کودتا، تغییر حکومت به
                  دیکتاتوری و نابودی ۴۰٪ خزانه آن خواهد شد.
                </span>
              </div>
            </div>

            <button
              onClick={onConfirmAllocation}
              disabled={allocatedBudget <= 0 || userTreasury < allocatedBudget}
              className="w-full py-3.5 bg-military hover:bg-military/90 disabled:opacity-40 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-military/10 flex items-center justify-center gap-2"
            >
              <Zap size={15} />
              <span>
                {userTreasury < allocatedBudget
                  ? "موجود نیست (خزانه ناکافی)"
                  : `تایید و اختصاص $${allocatedBudget.toLocaleString("fa-IR")} به جنگ نیابتی`}
              </span>
            </button>
          </>
        ) : (
          <div className="py-20 text-center text-xs text-muted-foreground italic">
            یک کشور را از فهرست انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  );
}
