import React, { useState } from "react";
import { Swords } from "lucide-react";
import { RECRUITABLE_UNITS, UnitConfig } from "./recruitable-units.config";
import { UnitRecruitmentCard } from "./unit-recruitment-card";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnitType } from "@/domain/military/military.schema";

interface MilitaryExpansionViewProps {
  nationId?: string;
}

export function MilitaryExpansionView({
  nationId = "NATION_118",
}: MilitaryExpansionViewProps) {
  const { dispatchAction } = useGameActions();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    INFANTRY: 1,
    AIR_FORCE: 1,
    DRONE_MISSILE: 1,
  });

  const handleQuantityChange = (type: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[type] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [type]: next };
    });
  };

  const handleRecruit = async (unit: UnitConfig) => {
    const qty = quantities[unit.type] || 1;

    await dispatchAction(
      {
        id: `recruit-${Date.now()}`,
        nationId,
        type: "RECRUIT_UNIT",
        unitType: unit.type as UnitType,
        quantity: qty,
      },
      `سفارش ساخت ${qty} یگان ${unit.name} در صف قرار گرفت.`,
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
        {RECRUITABLE_UNITS.map((unit) => (
          <UnitRecruitmentCard
            key={unit.type}
            unit={unit}
            quantity={quantities[unit.type] || 1}
            onQuantityChange={handleQuantityChange}
            onRecruit={handleRecruit}
          />
        ))}
      </div>
    </div>
  );
}
