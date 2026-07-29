import React, { useState } from "react";
import { UserMinus } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnitType } from "@/domain/military/military.schema";
import { ActionFactory } from "@/domain/game/action-factory";

interface DisbandUnitCardProps {
  nationId?: string;
}

export function DisbandUnitCard({
  nationId = "NATION_118",
}: DisbandUnitCardProps) {
  const [selectedUnitType, setSelectedUnitType] =
    useState<UnitType>("INFANTRY");
  const [disbandCount, setDisbandAmount] = useState<number>(5);
  const { dispatchAction } = useGameActions();

  const handleDisband = async () => {
    let typeLabel = "یگان پیاده‌نظام";
    if (selectedUnitType === "AIR_FORCE") typeLabel = "فروند جنگنده";
    else if (selectedUnitType === "DRONE_MISSILE")
      typeLabel = "یگان موشکی/پهپادی";

    const action = ActionFactory.disbandUnit(
      nationId,
      selectedUnitType,
      disbandCount,
    );

    await dispatchAction(
      action,
      `${disbandCount} ${typeLabel} منحل شد و نیروی انسانی به مخازن ملی بازگشت.`,
    );
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
            className={`py-1.5 rounded-lg transition-all ${
              selectedUnitType === "INFANTRY"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            پیاده‌نظام
          </button>
          <button
            onClick={() => setSelectedUnitType("AIR_FORCE")}
            className={`py-1.5 rounded-lg transition-all ${
              selectedUnitType === "AIR_FORCE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            جنگنده
          </button>
          <button
            onClick={() => setSelectedUnitType("DRONE_MISSILE")}
            className={`py-1.5 rounded-lg transition-all ${
              selectedUnitType === "DRONE_MISSILE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            پهپاد/موشک
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">تعداد انحلال:</span>
          <span className="font-mono font-bold text-foreground">
            {disbandCount} یگان
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="50"
          value={disbandCount}
          onChange={(e) => setDisbandAmount(Number(e.target.value))}
          className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <button
          onClick={handleDisband}
          className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          انحلال و بازیابی نیرو
        </button>
      </div>
    </div>
  );
}
