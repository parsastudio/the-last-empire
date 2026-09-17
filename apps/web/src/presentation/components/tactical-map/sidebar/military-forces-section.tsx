import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Swords } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { MilitaryForceUnitCard } from "@/presentation/components/tactical-map/sidebar/components/military-force-unit-card";
import { selectMilitaryForcesViewModel } from "@/presentation/selectors/military-view-model.selector";
import { MILITARY_UNIT_VISUALS } from "@/presentation/configs/military-unit-visuals.config";

interface MilitaryForcesSectionProps {
  nation?: Nation;
  provincesMap?: Record<string, Province>;
}

export function MilitaryForcesSection({
  nation,
  provincesMap,
}: MilitaryForcesSectionProps) {
  const t = useTranslations("military");

  const model = useMemo(
    () => selectMilitaryForcesViewModel(nation, provincesMap),
    [nation, provincesMap],
  );

  return (
    <div className="space-y-3 text-start font-sans">
      <div className="flex items-center gap-2 px-1">
        <Swords size={14} className="text-military" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          {t("militaryForcesHeader")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {model.units.map((unit) => {
          const visual = MILITARY_UNIT_VISUALS[unit.type];
          return (
            <MilitaryForceUnitCard
              key={unit.type}
              icon={visual.icon}
              iconColorClass={visual.colorClass}
              bgClass={visual.bgClass}
              name={t(`${unit.type}.name`)}
              unitLabel={t(`${unit.type}.unit`)}
              payrollCost={unit.payrollCost}
              count={unit.count}
              techRating={unit.techLevel}
            />
          );
        })}
      </div>
    </div>
  );
}
