import { NationalProjectConfig } from "@/domain/projects/national-project.schema";
import { NATIONAL_PROJECTS_CATALOG } from "@/domain/projects/national-projects-catalog.data";

export interface NationProjectStateContainer {
  projectProgressSteps?: Record<string, number>;
  completedProjectIds?: string[];
}

export class NationalProjectEffectApplierUtility {
  public static readonly MAX_BOOSTS_PER_TURN = 2;
  public static readonly TOTAL_STEPS = 30;

  public static getProjectConfig(
    projectId: string,
  ): NationalProjectConfig | undefined {
    return NATIONAL_PROJECTS_CATALOG.find((p) => p.id === projectId);
  }

  public static getProjectLevel(steps = 0): number {
    if (steps >= 30) return 3;
    if (steps >= 20) return 2;
    if (steps >= 10) return 1;
    return 0;
  }

  public static getNextMilestoneStep(steps = 0): number | null {
    if (steps < 10) return 10;
    if (steps < 20) return 20;
    if (steps < 30) return 30;
    return null;
  }

  public static getProjectLevelFromNation(
    nation: NationProjectStateContainer | null | undefined,
    projectId: string,
  ): number {
    if (!nation) return 0;
    if (nation.completedProjectIds?.includes(projectId)) return 3;
    const steps = nation.projectProgressSteps?.[projectId] || 0;
    return this.getProjectLevel(steps);
  }

  public static getFactoryYieldMultiplier(
    nation: NationProjectStateContainer | null | undefined,
  ): number {
    const level = this.getProjectLevelFromNation(
      nation,
      "automation_production_lines",
    );
    if (level === 3) return 1.35;
    if (level === 2) return 1.2;
    if (level === 1) return 1.1;
    return 1.0;
  }

  public static getResearchDiscountMultiplier(
    nation: NationProjectStateContainer | null | undefined,
  ): number {
    const level = this.getProjectLevelFromNation(
      nation,
      "scientific_research_optimization",
    );
    if (level === 3) return 0.65;
    if (level === 2) return 0.75;
    if (level === 1) return 0.85;
    return 1.0;
  }

  public static getProcurementDiscountMultiplier(
    nation: NationProjectStateContainer | null | undefined,
  ): number {
    const level = this.getProjectLevelFromNation(
      nation,
      "logistics_procurement_modernization",
    );
    if (level === 3) return 0.7;
    if (level === 2) return 0.8;
    if (level === 1) return 0.9;
    return 1.0;
  }

  public static getMilitaryPowerMultiplier(
    nation: NationProjectStateContainer | null | undefined,
  ): number {
    const level = this.getProjectLevelFromNation(
      nation,
      "combat_command_supremacy",
    );
    if (level === 3) return 1.3;
    if (level === 2) return 1.2;
    if (level === 1) return 1.1;
    return 1.0;
  }

  public static getCombinedMultiplier(
    completedIds: string[] = [],
    multiplierKey: string,
  ): number {
    const container = { completedProjectIds: completedIds };
    if (multiplierKey === "militaryPowerBonusMultiplier") {
      return this.getMilitaryPowerMultiplier(container);
    }
    if (multiplierKey === "factoryYieldBonusMultiplier") {
      return this.getFactoryYieldMultiplier(container);
    }
    return 1.0;
  }

  public static getCombinedDiscountMultiplier(
    completedIds: string[] = [],
    discountKey: string,
  ): number {
    const container = { completedProjectIds: completedIds };
    if (discountKey === "procurementCostDiscountMultiplier") {
      return this.getProcurementDiscountMultiplier(container);
    }
    if (discountKey === "researchCostDiscountMultiplier") {
      return this.getResearchDiscountMultiplier(container);
    }
    return 1.0;
  }

  public static getCombinedBonus(): number {
    return 0;
  }
}
