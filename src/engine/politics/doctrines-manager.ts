import type { DoctrinesState } from "@/domain/politics/doctrines.schema";
import {
  COMPREHENSIVE_RESEARCH_TREE,
  ResearchNode,
} from "@/domain/politics/research-tree.config";

export type { ResearchNode as Doctrine };

export class DoctrinesManager {
  private readonly doctrines: ResearchNode[] = COMPREHENSIVE_RESEARCH_TREE;

  public getAvailableDoctrines(): ResearchNode[] {
    return [...this.doctrines];
  }

  public purchaseDoctrine(
    state: DoctrinesState,
    doctrineId: string,
  ): DoctrinesState {
    const doctrine = this.doctrines.find((d) => d.id === doctrineId);
    if (!doctrine) {
      throw new Error("DOCTRINE_NOT_FOUND");
    }
    if ((state.unlockedDoctrines || []).includes(doctrineId)) {
      throw new Error("ALREADY_UNLOCKED");
    }
    if (state.doctrinePoints < doctrine.cost) {
      throw new Error("INSUFFICIENT_DOCTRINE_POINTS");
    }

    const missingPrereqs = doctrine.prerequisites.filter(
      (req) => !(state.unlockedDoctrines || []).includes(req),
    );
    if (missingPrereqs.length > 0) {
      throw new Error("PREREQUISITES_NOT_MET");
    }

    return {
      doctrinePoints: state.doctrinePoints - doctrine.cost,
      unlockedDoctrines: [...(state.unlockedDoctrines || []), doctrineId],
    };
  }

  public getGdpGrowthModifier(unlocked?: string[]): number {
    if (!unlocked) return 0;
    let bonus = 0;
    if (unlocked.includes("gdp-booster")) bonus += 0.05;
    if (unlocked.includes("cybernetic-automation")) bonus += 0.15;
    return bonus;
  }

  public getUpkeepMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("low-upkeep") ? 0.9 : 1.0;
  }

  public getReputationGainMultiplier(unlocked?: string[]): number {
    if (!unlocked) return 1.0;
    return unlocked.includes("reputation-recovery") ? 1.5 : 1.0;
  }
}
