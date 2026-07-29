import React, { useState } from "react";
import { RefreshCw, Zap, AlertTriangle, Lock } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { ActionFactory } from "@/domain/game/action-factory";

interface RegimeChangeCardProps {
  governmentType: string;
  turnsInPower?: number;
  gdp?: number;
  treasury?: number;
  nationId?: string;
}

export function RegimeChangeCard({
  governmentType,
  turnsInPower = 15,
  gdp = 450000000000,
  treasury = 100000,
  nationId = "NATION_118",
}: RegimeChangeCardProps) {
  const [selectedTargetGov, setSelectedTargetGov] = useState<GovernmentType>(
    governmentType === "DEMOCRACY" ? "DICTATORSHIP" : "DEMOCRACY",
  );
  const { dispatchAction } = useGameActions();

  const isLocked = turnsInPower < 15;
  const turnsRemaining = Math.max(0, 15 - turnsInPower);
  const changeCost = Math.min(250000, Math.floor(gdp * 0.05));
  const canAfford = treasury >= changeCost;

  const govOptions: { type: GovernmentType; name: string }[] = [
    { type: "DEMOCRACY", name: "دموکراسی" },
    { type: "DICTATORSHIP", name: "دیکتاتوری" },
    { type: "MONARCHY", name: "پادشاهی" },
    { type: "COMMUNISM", name: "کمونیسم" },
    { type: "FASCISM", name: "فاشیسم" },
  ];

  const handleRegimeChange = async () => {
    if (selectedTargetGov === governmentType || isLocked || !canAfford) {
      return;
    }

    const action = ActionFactory.changeGovernment(nationId, selectedTargetGov);
    await dispatchAction(
      action,
      "فرآیند برگزاری همه‌پرسی و تغییر حکومت آغاز شد.",
    );
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <RefreshCw size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تغییر رژیم سیاسی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">نظام فعلی:</span>
          <span className="font-bold text-foreground">{governmentType}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>هزینه همه‌پرسی:</span>
          <span className="font-bold text-gdp">
            ${changeCost.toLocaleString("fa-IR")}
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-sans">
            انتخاب نظام سیاسی جدید:
          </label>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {govOptions.map((gov) => {
              const isCurrent = gov.type === governmentType;
              const isSelected = gov.type === selectedTargetGov;
              return (
                <button
                  key={gov.type}
                  disabled={isCurrent}
                  onClick={() => setSelectedTargetGov(gov.type)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isCurrent
                      ? "opacity-40 border-border bg-secondary cursor-not-allowed text-muted-foreground"
                      : isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/60 text-foreground border-border/60 hover:bg-secondary"
                  }`}
                >
                  {gov.name}
                </button>
              );
            })}
          </div>
        </div>

        {isLocked ? (
          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-amber-500 font-mono">
            <Lock size={13} className="shrink-0" />
            <span className="font-sans">
              تغییر حکومت قفل است ({turnsRemaining} نوبت ماندگاری لازم).
            </span>
          </div>
        ) : (
          <div className="bg-military/10 border border-military/30 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-military font-mono">
            <AlertTriangle size={13} className="shrink-0" />
            <span className="font-sans">
              هشدار: تغییر حکومت باعث افت فوری ۴۰٪ ثبات سیاسی خواهد شد.
            </span>
          </div>
        )}

        <button
          onClick={handleRegimeChange}
          disabled={
            selectedTargetGov === governmentType || isLocked || !canAfford
          }
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap size={14} className="text-treasury" />
          <span>
            {isLocked
              ? `قفل تغییر حکومت (${turnsRemaining} نوبت)`
              : !canAfford
                ? "خزانه ناکافی جهت همه‌پرسی"
                : `تغییر حکومت به ${selectedTargetGov}`}
          </span>
        </button>
      </div>
    </div>
  );
}
