import React from "react";
import { Swords } from "lucide-react";
import {
  RECRUITABLE_UNITS,
  UnitConfig,
  UnitRecruitmentCard,
} from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnitType } from "@/domain/military/military.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface MilitaryExpansionViewProps {
  nationId: string;
  treasury?: number;
  manpower?: number;
}

export function MilitaryExpansionView({
  nationId,
  treasury = 100000,
  manpower = 500,
}: MilitaryExpansionViewProps) {
  const { dispatchAction } = useGameActions();

  const handleRecruit = async (unit: UnitConfig, quantity: number) => {
    if (quantity <= 0) return;

    const action = ActionFactory.recruitUnit(
      nationId,
      unit.type as UnitType,
      quantity,
    );

    await dispatchAction(
      action,
      `سفارش ساخت ${PersianNumberFormatter.toPersianDigits(quantity.toLocaleString("en-US"))} یگان ${unit.name} در صف قرار گرفت.`,
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
            treasury={treasury}
            manpower={manpower}
            onRecruit={handleRecruit}
          />
        ))}
      </div>
    </div>
  );
}
