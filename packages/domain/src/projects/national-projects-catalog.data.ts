import { NationalProjectConfig } from "@/domain/projects/national-project.schema";

export const PROJECT_STEP_FLAT_COST = 5_000_000_000;

export const NATIONAL_PROJECTS_CATALOG: readonly NationalProjectConfig[] =
  Object.freeze([
    {
      id: "automation_production_lines",
      category: "INDUSTRY",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      milestones: [
        { level: 1, stepThreshold: 10, factoryYieldBonusMultiplier: 0.1 },
        { level: 2, stepThreshold: 20, factoryYieldBonusMultiplier: 0.2 },
        { level: 3, stepThreshold: 30, factoryYieldBonusMultiplier: 0.35 },
      ],
    },
    {
      id: "scientific_research_optimization",
      category: "RESEARCH",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      milestones: [
        {
          level: 1,
          stepThreshold: 10,
          researchCostDiscountMultiplier: 0.15,
        },
        {
          level: 2,
          stepThreshold: 20,
          researchCostDiscountMultiplier: 0.25,
        },
        {
          level: 3,
          stepThreshold: 30,
          researchCostDiscountMultiplier: 0.35,
        },
      ],
    },
    {
      id: "logistics_procurement_modernization",
      category: "LOGISTICS",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      milestones: [
        {
          level: 1,
          stepThreshold: 10,
          procurementCostDiscountMultiplier: 0.1,
        },
        {
          level: 2,
          stepThreshold: 20,
          procurementCostDiscountMultiplier: 0.2,
        },
        {
          level: 3,
          stepThreshold: 30,
          procurementCostDiscountMultiplier: 0.3,
        },
      ],
    },
    {
      id: "combat_command_supremacy",
      category: "MILITARY",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      milestones: [
        { level: 1, stepThreshold: 10, militaryPowerBonusMultiplier: 0.1 },
        { level: 2, stepThreshold: 20, militaryPowerBonusMultiplier: 0.2 },
        { level: 3, stepThreshold: 30, militaryPowerBonusMultiplier: 0.3 },
      ],
    },
  ]);
