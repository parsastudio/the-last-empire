import React, { useState, useMemo } from "react";
import { UserMinus, Zap } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnitType, MilitaryStack } from "@/domain/military/military.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DisbandUnitCardProps {
  nationId?: string;
  military?: MilitaryStack;
}

export function DisbandUnitCard({
  nationId = "NATION_118",
  military,
}: DisbandUnitCardProps) {
  const [selectedUnitType, setSelectedUnitType] =
    useState<UnitType>("INFANTRY");

  const maxAvailable = useMemo(() => {
    if (!military) return 50;
    switch (selectedUnitType) {
      case "INFANTRY":
        return military.infantry;
      case "AIR_FORCE":
        return military.airForce;
      case "DRONE_MISSILE":
        return military.droneMissile;
      default:
        return 0;
    }
  }, [military, selectedUnitType]);

  const [disbandCount, setDisbandCount] = useState<number>(1);

  const effectiveCount = Math.min(disbandCount, Math.max(0, maxAvailable));

  const { dispatchAction } = useGameActions();

  const handleDisband = async () => {
    if (effectiveCount <= 0 || effectiveCount > maxAvailable) return;

    let typeLabel = "یگان پیاده‌نظام";
    if (selectedUnitType === "AIR_FORCE") typeLabel = "فروند جنگنده";
    else if (selectedUnitType === "DRONE_MISSILE")
      typeLabel = "یگان موشکی/پهپادی";

    const action = ActionFactory.disbandUnit(
      nationId,
      selectedUnitType,
      effectiveCount,
    );

    await dispatchAction(
      action,
      `${PersianNumberFormatter.toPersianDigits(effectiveCount)} ${typeLabel} منحل شد و نیروی انسانی به مخازن ملی بازگشت.`,
    );
  };

  const handlePercentageSelect = (pct: number) => {
    if (maxAvailable <= 0) return;
    const target = Math.max(1, Math.floor(maxAvailable * pct));
    setDisbandCount(target);
  };

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <UserMinus size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          انحلال یگان و بازیابی نیروی انسانی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right">
        <div className="grid grid-cols-3 gap-1 bg-secondary/60 p-1 rounded-xl text-[10px] font-bold">
          <button
            onClick={() => setSelectedUnitType("INFANTRY")}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedUnitType === "INFANTRY"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            پیاده‌نظام
          </button>
          <button
            onClick={() => setSelectedUnitType("AIR_FORCE")}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedUnitType === "AIR_FORCE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            جنگنده
          </button>
          <button
            onClick={() => setSelectedUnitType("DRONE_MISSILE")}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedUnitType === "DRONE_MISSILE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            پهپاد/موشک
          </button>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            موجود در خدمت:
          </span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              maxAvailable.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            تعداد انحلال انتخابی:
          </span>
          <span className="font-bold text-rose-500">
            {PersianNumberFormatter.toPersianDigits(
              effectiveCount.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <input
          type="range"
          min={maxAvailable > 0 ? 1 : 0}
          max={Math.max(0, maxAvailable)}
          disabled={maxAvailable === 0}
          value={effectiveCount}
          onChange={(e) => setDisbandCount(Number(e.target.value))}
          className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30"
        />

        <div className="grid grid-cols-4 gap-1.5 pt-1 font-sans">
          <button
            type="button"
            disabled={maxAvailable === 0}
            onClick={() => handlePercentageSelect(0.25)}
            className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            ۲۵٪
          </button>
          <button
            type="button"
            disabled={maxAvailable === 0}
            onClick={() => handlePercentageSelect(0.5)}
            className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            ۵۰٪
          </button>
          <button
            type="button"
            disabled={maxAvailable === 0}
            onClick={() => handlePercentageSelect(0.75)}
            className="py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 text-[9px] font-mono font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            ۷۵٪
          </button>
          <button
            type="button"
            disabled={maxAvailable === 0}
            onClick={() => handlePercentageSelect(1.0)}
            className="py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[9px] font-mono font-bold text-rose-500 transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-30"
          >
            <Zap size={10} />
            <span>۱۰۰٪ (کل)</span>
          </button>
        </div>

        <button
          onClick={handleDisband}
          disabled={maxAvailable === 0 || effectiveCount <= 0}
          className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 disabled:bg-secondary disabled:text-muted-foreground text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          {maxAvailable === 0
            ? "هیچ یگانی از این نوع برای انحلال وجود ندارد"
            : `انحلال ${PersianNumberFormatter.toPersianDigits(effectiveCount.toLocaleString("en-US"))} یگان و بازیابی نیروی انسانی`}
        </button>
      </div>
    </div>
  );
}
