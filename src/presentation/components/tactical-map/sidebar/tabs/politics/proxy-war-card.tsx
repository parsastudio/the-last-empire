import React, { useState, useMemo } from "react";
import { Zap, ShieldAlert, Crosshair } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { Nation } from "@/domain/nation/nation.schema";

interface ProxyWarCardProps {
  nationId?: string;
  nationsMap?: Record<string, Nation>;
}

export function ProxyWarCard({
  nationId = "NATION_118",
  nationsMap,
}: ProxyWarCardProps) {
  const { dispatchAction } = useGameActions();

  const countryOptions = useMemo(() => {
    if (!nationsMap) return [];
    return Object.values(nationsMap)
      .filter((n) => n.id !== nationId && n.isAlive)
      .map((n) => ({
        id: n.id,
        name: n.name,
      }));
  }, [nationId, nationsMap]);

  const defaultTarget = countryOptions[0]?.id || "NATION_15";
  const [currentTargetId, setCurrentTargetId] = useState<string>(defaultTarget);
  const [budget, setBudget] = useState<number>(15000);

  const estimatedStabilityDrain = Math.min(
    15,
    Math.max(1, Math.floor(Math.log10(budget) * 3)),
  );

  const targetName =
    countryOptions.find((c) => c.id === currentTargetId)?.name || "کشور هدف";

  const currentAllocatedBudget =
    nationsMap && nationsMap[nationId]
      ? nationsMap[nationId].proxyInfluenceBudget[currentTargetId] || 0
      : 0;

  const handleApplyProxy = async () => {
    await dispatchAction(
      {
        id: `proxy-${Date.now()}`,
        nationId,
        type: "FUND_PROXY_INFLUENCE",
        targetNationId: currentTargetId,
        budget,
      },
      `مبلغ $${budget.toLocaleString("fa-IR")} جهت تضعیف ثبات سیاسی ${targetName} اختصاص یافت.`,
    );
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Zap size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          بودجه نفوذ و جنگ نیابتی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
            <Crosshair size={12} className="text-military" />
            انتخاب کشور هدف عملیات:
          </label>
          <select
            value={currentTargetId}
            onChange={(e) => setCurrentTargetId(e.target.value)}
            className="w-full bg-secondary/80 border border-border/80 rounded-xl py-1.5 px-3 text-xs text-foreground text-right cursor-pointer"
          >
            {countryOptions.map((opt) => (
              <option
                key={opt.id}
                value={opt.id}
                className="bg-card text-foreground"
              >
                {opt.name} ({opt.id})
              </option>
            ))}
          </select>
        </div>

        {currentAllocatedBudget > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl text-[10px] font-mono flex justify-between">
            <span className="text-muted-foreground font-sans">
              بودجه جاری فعال:
            </span>
            <span className="font-bold text-gdp">
              ${currentAllocatedBudget.toLocaleString("fa-IR")}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">افزایش بودجه عملیات:</span>
          <span className="font-mono font-bold text-foreground">
            ${budget.toLocaleString("fa-IR")}
          </span>
        </div>

        <input
          type="range"
          min="5000"
          max="50000"
          step="5000"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <div className="bg-secondary/40 border border-border/40 p-2.5 rounded-xl flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground flex items-center gap-1 font-sans">
            <ShieldAlert size={12} className="text-military" />
            تخریب ثبات سیاسی {targetName}:
          </span>
          <span className="font-bold text-military">
            -{estimatedStabilityDrain}% / نوبت
          </span>
        </div>

        <button
          onClick={handleApplyProxy}
          className="w-full py-2.5 bg-military/15 hover:bg-military/25 text-military border border-military/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          تزریق بودجه عملیات پنهان علیه {targetName}
        </button>
      </div>
    </div>
  );
}
