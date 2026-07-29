import React, { useState } from "react";
import { Swords } from "lucide-react";
import { RECRUITABLE_UNITS, UnitConfig } from "./recruitable-units.config";
import { UnitRecruitmentCard } from "./unit-recruitment-card";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnitType } from "@/domain/military/military.schema";

interface MilitaryExpansionViewProps {
  nationId?: string;
  treasury?: number;
  manpower?: number;
  steel?: number;
}

export function MilitaryExpansionView({
  nationId = "NATION_118",
  treasury = 100000,
  manpower = 500,
  steel = 1000,
}: MilitaryExpansionViewProps) {
  const { dispatchAction } = useGameActions();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    INFANTRY: 1,
    AIR_FORCE: 1,
    DRONE_MISSILE: 1,
  });

  const handleQuantitySet = (type: string, amount: number) => {
    setQuantities((prev) => ({ ...prev, [type]: amount }));
  };

  const calculateMaxAffordable = (unit: UnitConfig): number => {
    const maxMoney =
      unit.moneyCost > 0 ? Math.floor(treasury / unit.moneyCost) : Infinity;
    const maxManpower =
      unit.manpowerCost > 0
        ? Math.floor(manpower / unit.manpowerCost)
        : Infinity;
    const maxSteel =
      unit.steelCost > 0 ? Math.floor(steel / unit.steelCost) : Infinity;

    return Math.max(0, Math.min(maxMoney, maxManpower, maxSteel));
  };

  const handleRecruit = async (unit: UnitConfig) => {
    const qty = quantities[unit.type] || 0;
    if (qty <= 0) return;

    await dispatchAction(
      {
        id: `recruit-${Date.now()}`,
        nationId,
        type: "RECRUIT_UNIT",
        unitType: unit.type as UnitType,
        quantity: qty,
      },
      `سفارش ساخت ${qty.toLocaleString("fa-IR")} یگان ${unit.name} در صف قرار گرفت.`,
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Swords size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          گسترش و استخدام نیروی نظامی
        </span>
      </div>

      <div className="space-y-3">
        {RECRUITABLE_UNITS.map((unit) => {
          const maxAffordable = calculateMaxAffordable(unit);
          const currentQty = Math.min(
            quantities[unit.type] ?? 1,
            maxAffordable,
          );

          return (
            <UnitRecruitmentCard
              key={unit.type}
              unit={unit}
              quantity={currentQty}
              maxAffordable={maxAffordable}
              onQuantitySet={handleQuantitySet}
              onRecruit={handleRecruit}
            />
          );
        })}
      </div>
    </div>
  );
}
