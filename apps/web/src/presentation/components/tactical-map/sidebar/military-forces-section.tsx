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
import { Province } from "@/domain/province/province.schema";
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
  provincesMap?: Record<string, Province>;
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
  provincesMap,
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
      branchTech: MilitaryInventoryHelper.initializeBranchTech(techLevel),
    },
  };

  const payroll = MilitaryPayrollCalculator.calculatePayroll(
    activeNation,
    provincesMap,
  );

  const infTech = MilitaryInventoryHelper.getBranchTech(
    activeNation.military,
    "INFANTRY",
  );
  const armTech = MilitaryInventoryHelper.getBranchTech(
    activeNation.military,
    "ARMOR",
  );
  const adTech = MilitaryInventoryHelper.getBranchTech(
    activeNation.military,
    "AIR_DEFENSE",
  );
  const afTech = MilitaryInventoryHelper.getBranchTech(
    activeNation.military,
    "AIR_FORCE",
  );
  const drTech = MilitaryInventoryHelper.getBranchTech(
    activeNation.military,
    "DRONE_MISSILE",
  );
  const nvTech = MilitaryInventoryHelper.getBranchTech(
    activeNation.military,
    "NAVAL_FLEET",
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
          <MilitaryForceUnitCard
            icon={Shield}
            iconColorClass="text-primary"
            name="پیاده‌نظام"
            payrollCost={payroll.infantry}
            count={infantry}
            techRating={infTech}
          />

          <MilitaryForceUnitCard
            icon={ShieldAlert}
            iconColorClass="text-military"
            name="زرهی و تانک"
            payrollCost={payroll.armor}
            count={armor}
            techRating={armTech}
          />

          <MilitaryForceUnitCard
            icon={Crosshair}
            iconColorClass="text-diplomacy"
            name="پدافند هوایی"
            payrollCost={payroll.airDefense}
            count={airDefense}
            techRating={adTech}
          />

          <MilitaryForceUnitCard
            icon={Plane}
            iconColorClass="text-gdp"
            name="نیروی هوایی"
            payrollCost={payroll.airForce}
            count={airForce}
            techRating={afTech}
          />

          <MilitaryForceUnitCard
            icon={Radio}
            iconColorClass="text-treasury"
            name="پهپاد و موشک"
            payrollCost={payroll.droneMissile}
            count={droneMissile}
            techRating={drTech}
          />

          <MilitaryForceUnitCard
            icon={Anchor}
            iconColorClass="text-primary"
            name="ناوگان دریایی"
            payrollCost={payroll.navalFleet}
            count={navalFleet}
            techRating={nvTech}
          />
        </div>

        <MilitaryReadinessCard techLevel={techLevel} experience={experience} />
      </div>
    </div>
  );
}
