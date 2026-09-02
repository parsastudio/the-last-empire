import { NationalProjectConfig } from "@/domain/projects/national-project.schema";
import { NATIONAL_PROJECTS_CATALOG } from "@/domain/projects/national-projects-catalog.data";

export class NationalProjectEffectApplierUtility {
  public static readonly MAX_BOOSTS_PER_TURN = 2;

  public static getProjectConfig(
    projectId: string,
  ): NationalProjectConfig | undefined {
    return NATIONAL_PROJECTS_CATALOG.find((p) => p.id === projectId);
  }

  public static getCompletedProjects(
    completedIds: string[] = [],
  ): NationalProjectConfig[] {
    return NATIONAL_PROJECTS_CATALOG.filter((p) => completedIds.includes(p.id));
  }

  public static hasEffect<K extends keyof NationalProjectConfig["effect"]>(
    completedIds: string[] = [],
    effectKey: K,
  ): boolean {
    const completed = this.getCompletedProjects(completedIds);
    return completed.some((p) => p.effect[effectKey] !== undefined);
  }

  public static getCombinedMultiplier(
    completedIds: string[] = [],
    multiplierKey:
      | "factoryYieldBonusMultiplier"
      | "militaryPowerBonusMultiplier"
      | "globalTradeIncomeBonusMultiplier",
  ): number {
    const completed = this.getCompletedProjects(completedIds);
    let totalMultiplier = 1.0;
    for (let i = 0; i < completed.length; i++) {
      const val = completed[i]!.effect[multiplierKey];
      if (typeof val === "number") {
        totalMultiplier += val;
      }
    }
    return totalMultiplier;
  }
}
