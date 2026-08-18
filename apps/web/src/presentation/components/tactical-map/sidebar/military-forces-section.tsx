import React from "react";
import {
  Swords,
  Shield,
  ShieldAlert,
  Plane,
  Radio,
  Anchor,
  Crosshair,
} from "lucide-react";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { Nation } from "@/domain/nation/nation.schema";
import { DEFAULT_NATION_MOCK } from "@/domain/nation/default-nation.mock";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { MilitaryForceUnitCard } from "@/presentation/components/tactical-map/sidebar/components/military-force-unit-card";
import { MilitaryReadinessCard } from "@/presentation/components/tactical-map/sidebar/components/military-readiness-card";

interface MilitaryForcesSectionProps {
  infantry: number;
  armor?: number;
  airDefense?: number;
  airForce: number;
  droneMissile: number;
  navalFleet?: number;
  techLevel: number;
  experience: number;
  nation?: Nation;
}

export function MilitaryForcesSection({
  infantry,
  armor = 0,
  airDefense = 0,
  airForce,
  droneMissile,
  navalFleet = 0,
  techLevel,
  experience,
  nation,
}: MilitaryForcesSectionProps) {
  const activeNation: Nation = nation || {
    ...DEFAULT_NATION_MOCK,
    military: {
      infantry,
      armor,
      airDefense,
      airForce,
      droneMissile,
      navalFleet,
      experience,
      techLevel,
    },
  };

  const payroll = MilitaryPayrollCalculator.calculatePayroll(activeNation);

  const infantryBreakdown = MilitaryInventoryHelper.getBreakdown(
    activeNation.military,
    "INFANTRY",
  );
  const armorBreakdown = MilitaryInventoryHelper.getBreakdown(
    activeNation.military,
    "ARMOR",
  );
  const airDefenseBreakdown = MilitaryInventoryHelper.getBreakdown(
    activeNation.military,
    "AIR_DEFENSE",
  );
  const airForceBreakdown = MilitaryInventoryHelper.getBreakdown(
    activeNation.military,
    "AIR_FORCE",
  );
  const droneBreakdown = MilitaryInventoryHelper.getBreakdown(
    activeNation.military,
    "DRONE_MISSILE",
  );
  const navalBreakdown = MilitaryInventoryHelper.getBreakdown(
    activeNation.military,
    "NAVAL_FLEET",
  );

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <Swords size={14} className="text-military" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          قدرت ارکانی ارتش و تفکیک سطح فناوری یگان‌ها
        </span>
      </div>

      <div className="space-y-2.5 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <MilitaryForceUnitCard
            icon={Shield}
            iconColorClass="text-primary"
            name="پیاده‌نظام"
            payrollCost={payroll.infantry}
            count={infantry}
            breakdown={infantryBreakdown}
          />

          <MilitaryForceUnitCard
            icon={ShieldAlert}
            iconColorClass="text-military"
            name="زرهی و تانک"
            payrollCost={payroll.armor}
            count={armor}
            breakdown={armorBreakdown}
          />

          <MilitaryForceUnitCard
            icon={Crosshair}
            iconColorClass="text-diplomacy"
            name="پدافند هوایی"
            payrollCost={payroll.airDefense}
            count={airDefense}
            breakdown={airDefenseBreakdown}
          />

          <MilitaryForceUnitCard
            icon={Plane}
            iconColorClass="text-gdp"
            name="نیروی هوایی"
            payrollCost={payroll.airForce}
            count={airForce}
            breakdown={airForceBreakdown}
          />

          <MilitaryForceUnitCard
            icon={Radio}
            iconColorClass="text-treasury"
            name="پهپاد و موشک"
            payrollCost={payroll.droneMissile}
            count={droneMissile}
            breakdown={droneBreakdown}
          />

          <MilitaryForceUnitCard
            icon={Anchor}
            iconColorClass="text-primary"
            name="ناوگان دریایی"
            payrollCost={payroll.navalFleet}
            count={navalFleet}
            breakdown={navalBreakdown}
          />
        </div>

        <MilitaryReadinessCard techLevel={techLevel} experience={experience} />
      </div>
    </div>
  );
}
