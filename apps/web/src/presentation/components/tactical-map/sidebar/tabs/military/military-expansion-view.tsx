import React, { useState } from "react";
import { Swords } from "lucide-react";
import {
  RECRUITABLE_UNITS,
  UnitConfig,
  UnitRecruitmentCard,
} from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";
import { UnitRecruitModal } from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruit-modal";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { UnitType } from "@/domain/military/military.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface MilitaryExpansionViewProps {
  nationId: string;
  treasury?: number;
  techLevel?: number;
  industrialLevel?: number;
}

export function MilitaryExpansionView({
  nationId,
  treasury = 100000,
  techLevel = 1,
  industrialLevel = 1,
}: MilitaryExpansionViewProps) {
  const { dispatchAction } = useGameActions();
  const [selectedUnitForModal, setSelectedUnitForModal] =
    useState<UnitConfig | null>(null);

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
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right pt-2 border-t border-border/40">
      <div className="flex items-center gap-2 px-1">
        <Swords size={14} className="text-military" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
          گسترش و استخدام نیروی نظامی داخلی
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECRUITABLE_UNITS.map((unit) => (
          <UnitRecruitmentCard
            key={unit.type}
            unit={unit}
            techLevel={techLevel}
            industrialLevel={industrialLevel}
            onOpenRecruitModal={(u) => setSelectedUnitForModal(u)}
          />
        ))}
      </div>

      <UnitRecruitModal
        isOpen={selectedUnitForModal !== null}
        unit={selectedUnitForModal}
        treasury={treasury}
        techLevel={techLevel}
        industrialLevel={industrialLevel}
        onClose={() => setSelectedUnitForModal(null)}
        onConfirm={handleRecruit}
      />
    </div>
  );
}
