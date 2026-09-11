import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Swords } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { MilitaryForceUnitCard } from "@/presentation/components/tactical-map/sidebar/components/military-force-unit-card";
import { MilitaryReadinessCard } from "@/presentation/components/tactical-map/sidebar/components/military-readiness-card";
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
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Swords size={14} className="text-military" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          {t("militaryForcesHeader")}
        </span>
      </div>

      <div className="space-y-2.5 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {model.units.map((unit) => {
            const visual = MILITARY_UNIT_VISUALS[unit.type];
            return (
              <MilitaryForceUnitCard
                key={unit.type}
                icon={visual.icon}
                iconColorClass={visual.colorClass}
                name={t(`${unit.type}.name`)}
                payrollCost={unit.payrollCost}
                count={unit.count}
                techRating={unit.techLevel}
              />
            );
          })}
        </div>

        <MilitaryReadinessCard techLevel={model.techLevel} />
      </div>
    </div>
  );
}
