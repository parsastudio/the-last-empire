import {
  NationalProjectConfig,
  NationalProjectEffect,
} from "@/domain/projects/national-project.schema";
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
    if (!completedIds || completedIds.length === 0) return [];
    return NATIONAL_PROJECTS_CATALOG.filter((p) => completedIds.includes(p.id));
  }

  public static getCombinedBonus<K extends keyof NationalProjectEffect>(
    completedIds: string[] = [],
    effectKey: K,
  ): number {
    const completed = this.getCompletedProjects(completedIds);
    let total = 0;
    for (let i = 0; i < completed.length; i++) {
      const val = completed[i]!.effect[effectKey];
      if (typeof val === "number") {
        total += val;
      }
    }
    return total;
  }

  public static getCombinedMultiplier<K extends keyof NationalProjectEffect>(
    completedIds: string[] = [],
    multiplierKey: K,
  ): number {
    return 1.0 + this.getCombinedBonus(completedIds, multiplierKey);
  }

  public static getCombinedDiscountMultiplier<
    K extends keyof NationalProjectEffect,
  >(completedIds: string[] = [], discountKey: K): number {
    const totalDiscount = this.getCombinedBonus(completedIds, discountKey);
    return Math.max(0.1, Number((1.0 - totalDiscount).toFixed(2)));
  }
}
