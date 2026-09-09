import {
  Nation,
  UnitType,
  MilitaryQuotaCalculator,
  NATIONAL_PROJECTS_CATALOG,
  NationalProjectEffectApplierUtility,
  CountryRegistry,
  MapTopologyRegistry,
} from "@geopolitics/domain";
import { TurnContext } from "@/engine/pipeline/turn-context";
import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";

export interface AiDomainNeedScores {
  militaryProcurementScore: number;
  infrastructureScore: number;
  innovationScore: number;
  nationalProjectsScore: number;
  geopoliticsScore: number;
}

export class AiNeedScoringEngine {
  public static calculateNeedScores(
    nation: Nation,
    context: TurnContext,
    posture: AIPosture,
  ): AiDomainNeedScores {
    const militaryScore = this.scoreMilitaryNeed(nation, context, posture);
    const infrastructureScore = this.scoreInfrastructureNeed(nation, context);
    const innovationScore = this.scoreInnovationNeed(nation, posture);
    const projectsScore = this.scoreNationalProjectsNeed(nation, posture);
    const geopoliticsScore = this.scoreGeopoliticsNeed(
      nation,
      context,
      posture,
    );

    return {
      militaryProcurementScore: militaryScore,
      infrastructureScore,
      innovationScore,
      nationalProjectsScore: projectsScore,
      geopoliticsScore,
    };
  }

  private static scoreMilitaryNeed(
    nation: Nation,
    context: TurnContext,
    posture: AIPosture,
  ): number {
    let score = 25;

    if (posture === "WAR") {
      score += 55;
    } else if (posture === "THREAT") {
      score += 35;
    }

    if (nation.doctrine === "MILITARIST_HAWK") {
      score += 20;
    } else if (nation.doctrine === "GLOBAL_HEGEMON") {
      score += 15;
    }

    const gdp = context.getNationGdp(nation.id);
    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      gdp,
      nation.military,
    );
    const types: UnitType[] = [
      "ARMOR",
      "AIR_FORCE",
      "AIR_DEFENSE",
      "INFANTRY",
      "DRONE_MISSILE",
    ];

    let totalRemainingRoom = 0;
    let totalMaxUnits = 0;
    for (const t of types) {
      totalRemainingRoom += quotas[t]?.remainingRoom ?? 0;
      totalMaxUnits += quotas[t]?.maxUnits ?? 1;
    }

    const vacancyRatio =
      totalMaxUnits > 0 ? totalRemainingRoom / totalMaxUnits : 0;
    score += Math.round(vacancyRatio * 20);

    return Math.max(5, Math.min(100, score));
  }

  private static scoreInfrastructureNeed(
    nation: Nation,
    context: TurnContext,
  ): number {
    let score = 20;
    const myProvs = context.getOwnedProvinces(nation.id);

    let emptySlots = 0;
    let totalSlots = 0;
    for (const p of myProvs) {
      const maxSlots = MapTopologyRegistry.getMaxSlots(p.provinceId, 1);
      totalSlots += maxSlots;
      emptySlots += Math.max(0, maxSlots - p.factoriesCount);
    }

    if (emptySlots > 0 && totalSlots > 0) {
      score += Math.round((emptySlots / totalSlots) * 35);
    }

    const modernizationGap = Math.max(
      0,
      nation.industrialLevel - nation.equipmentTechLevel,
    );
    if (modernizationGap > 0.05) {
      score += Math.min(30, Math.round(modernizationGap * 40));
    }

    if (nation.doctrine === "DOMESTIC_INDUSTRIALIST") {
      score += 25;
    } else if (nation.doctrine === "MERCANTILE_ECONOMIC") {
      score += 15;
    }

    return Math.max(5, Math.min(100, score));
  }

  private static scoreInnovationNeed(
    nation: Nation,
    posture: AIPosture,
  ): number {
    let score = 20;

    if (nation.doctrine === "DOMESTIC_INDUSTRIALIST") {
      score += 35;
    } else if (nation.doctrine === "GLOBAL_HEGEMON") {
      score += 25;
    }

    if (posture === "PEACE") {
      score += 15;
    }

    const milTechInt = Math.floor(nation.military.techLevel);
    const indTechInt = Math.floor(nation.industrialLevel);
    if (milTechInt <= 3 || indTechInt <= 3) {
      score += 15;
    }

    return Math.max(5, Math.min(100, score));
  }

  private static scoreNationalProjectsNeed(
    nation: Nation,
    posture: AIPosture,
  ): number {
    let score = 15;

    const boostedProjectIds = contextBoostedProjects(nation);
    const completedIds = nation.completedProjectIds || [];
    const maxBoosts = NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN;

    if (boostedProjectIds.length >= maxBoosts) {
      return 0;
    }

    const candidateProjects = NATIONAL_PROJECTS_CATALOG.filter(
      (p) => !completedIds.includes(p.id) && !boostedProjectIds.includes(p.id),
    );

    if (candidateProjects.length === 0) {
      return 0;
    }

    const progressSteps = nation.projectProgressSteps || {};
    const hasPartiallyFinished = candidateProjects.some(
      (p) => (progressSteps[p.id] || 0) > 0,
    );
    if (hasPartiallyFinished) {
      score += 30;
    }

    if (nation.government.stability < 40) {
      score += 25;
    }

    if (posture === "PEACE") {
      score += 20;
    } else {
      score -= 10;
    }

    if (
      nation.doctrine === "GLOBAL_HEGEMON" ||
      nation.doctrine === "MERCANTILE_ECONOMIC"
    ) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private static scoreGeopoliticsNeed(
    nation: Nation,
    context: TurnContext,
    posture: AIPosture,
  ): number {
    let score = 10;

    if (nation.globalReputation <= -25) {
      score += 25;
    }

    const reachable = context.getReachableTargets(nation);
    let potentialAllies = 0;
    for (const target of reachable) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      const rel = nation.relations?.[canonicalTarget];
      if (rel && rel.stance !== "WAR" && rel.alignment >= 15) {
        potentialAllies++;
      }
    }

    if (potentialAllies > 0) {
      score += Math.min(25, potentialAllies * 8);
    }

    if (posture === "WAR" || posture === "THREAT") {
      score += 20;
    }

    return Math.max(5, Math.min(100, score));
  }
}

function contextBoostedProjects(nation: Nation): string[] {
  return nation.projectProgressSteps ? [] : [];
}
