import React, { useMemo } from "react";
import {
  Swords,
  Shield,
  ShieldAlert,
  Plane,
  Radio,
  Crosshair,
  LucideIcon,
} from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { MilitaryForceUnitCard } from "@/presentation/components/tactical-map/sidebar/components/military-force-unit-card";
import { MilitaryReadinessCard } from "@/presentation/components/tactical-map/sidebar/components/military-readiness-card";
import { selectMilitaryForcesViewModel } from "@/presentation/selectors/military-view-model.selector";
import { UnitType } from "@geopolitics/domain";

const UNIT_ICONS: Record<UnitType, { icon: LucideIcon; color: string }> = {
  INFANTRY: { icon: Shield, color: "text-primary" },
  ARMOR: { icon: ShieldAlert, color: "text-military" },
  AIR_DEFENSE: { icon: Crosshair, color: "text-diplomacy" },
  AIR_FORCE: { icon: Plane, color: "text-gdp" },
  DRONE_MISSILE: { icon: Radio, color: "text-treasury" },
};

interface MilitaryForcesSectionProps {
  nation?: Nation;
  provincesMap?: Record<string, Province>;
}

export function MilitaryForcesSection({
  nation,
  provincesMap,
}: MilitaryForcesSectionProps) {
  const model = useMemo(
    () => selectMilitaryForcesViewModel(nation, provincesMap),
    [nation, provincesMap],
  );

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Swords size={14} className="text-military" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          قدرت ارکانی ارتش و سطح فناوری یگان‌ها
        </span>
      </div>

      <div className="space-y-2.5 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {model.units.map((unit) => {
            const iconConfig = UNIT_ICONS[unit.type];
            return (
              <MilitaryForceUnitCard
                key={unit.type}
                icon={iconConfig.icon}
                iconColorClass={iconConfig.color}
                name={unit.nameFa}
                payrollCost={unit.payrollCost}
                count={unit.count}
                techRating={unit.techLevel}
              />
            );
          })}
        </div>

        <MilitaryReadinessCard
          techLevel={model.techLevel}
          experience={model.experience}
        />
      </div>
    </div>
  );
}
