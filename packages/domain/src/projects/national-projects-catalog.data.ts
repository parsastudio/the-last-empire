import { NationalProjectConfig } from "@/domain/projects/national-project.schema";

export const PROJECT_STEP_FLAT_COST = 5_000_000_000;

export const NATIONAL_PROJECTS_CATALOG: readonly NationalProjectConfig[] =
  Object.freeze([
    {
      id: "automation_production_lines",
      category: "INDUSTRY_TECH",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factoryYieldBonusMultiplier: 0.1,
      },
    },
    {
      id: "rapid_deployment_doctrine",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        militaryPowerBonusMultiplier: 0.1,
      },
    },
    {
      id: "free_transit_gateways",
      category: "ECONOMIC",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.15,
      },
    },
    {
      id: "passive_defense_fortifications",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        defenseCasualtyReductionMultiplier: 0.15,
      },
    },
    {
      id: "diplomatic_soft_power_network",
      category: "GEOPOLITICAL",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 10,
      },
    },
    {
      id: "smart_logistics_hub",
      category: "MILITARY",
      tier: "SHORT_TERM",
      totalStepsRequired: 10,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        maintenanceCostDiscountMultiplier: 0.1,
      },
    },
    {
      id: "integrated_laser_radar_grid",
      category: "MILITARY",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        autoMissileInterceptionRate: 0.2,
      },
    },
    {
      id: "continental_energy_corridor",
      category: "GEOPOLITICAL",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        permanentStabilityBonus: 8,
      },
    },
    {
      id: "electronic_warfare_ai_hub",
      category: "GEOPOLITICAL",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 8,
        autoMissileInterceptionRate: 0.05,
      },
    },
    {
      id: "nano_alloy_metallurgy",
      category: "INDUSTRY_TECH",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        procurementCostDiscountMultiplier: 0.15,
      },
    },
    {
      id: "national_industrial_zones",
      category: "INDUSTRY_TECH",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factorySlotExpansionRatio: 0.2,
      },
    },
    {
      id: "strategic_currency_clearing",
      category: "ECONOMIC",
      tier: "MID_TERM",
      totalStepsRequired: 20,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.25,
      },
    },
    {
      id: "quantum_fusion_grid",
      category: "INDUSTRY_TECH",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        factoryYieldBonusMultiplier: 0.2,
        factorySlotExpansionRatio: 0.3,
      },
    },
    {
      id: "petro_currency_hegemony",
      category: "ECONOMIC",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalTradeIncomeBonusMultiplier: 0.35,
        petroTributeShare: 0.002,
      },
    },
    {
      id: "strategic_deterrence_triad",
      category: "MILITARY",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        deterrenceWarThresholdMultiplier: 1.3,
        globalReputationBonus: 10,
      },
    },
    {
      id: "combined_arms_supremacy",
      category: "MILITARY",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        militaryPowerBonusMultiplier: 0.2,
      },
    },
    {
      id: "multilateral_treaty_architecture",
      category: "GEOPOLITICAL",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        globalReputationBonus: 20,
        permanentStabilityBonus: 10,
      },
    },
    {
      id: "advanced_robotics_defense_arsenal",
      category: "INDUSTRY_TECH",
      tier: "LONG_TERM",
      totalStepsRequired: 30,
      costPerStep: PROJECT_STEP_FLAT_COST,
      effect: {
        procurementCostDiscountMultiplier: 0.2,
        maintenanceCostDiscountMultiplier: 0.2,
      },
    },
  ]);
