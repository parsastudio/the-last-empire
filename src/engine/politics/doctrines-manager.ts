import type { DoctrinesState } from "@/domain/politics/doctrines.schema";
import { DEFAULT_DOCTRINES, Doctrine } from "./doctrines-list.config";

export type { Doctrine };

export class DoctrinesManager {
  private readonly doctrines: Doctrine[] = DEFAULT_DOCTRINES;

  public getAvailableDoctrines(): Doctrine[] {
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

    return {
      doctrinePoints: state.doctrinePoints - doctrine.cost,
      unlockedDoctrines: [...(state.unlockedDoctrines || []), doctrineId],
    };
  }

  public getGdpGrowthModifier(unlocked?: string[]): number {
    return (unlocked || []).includes("gdp-booster") ? 0.05 : 0;
  }

  public getUpkeepMultiplier(unlocked?: string[]): number {
    return (unlocked || []).includes("low-upkeep") ? 0.9 : 1.0;
  }

  public getReputationGainMultiplier(unlocked?: string[]): number {
    return (unlocked || []).includes("reputation-recovery") ? 1.5 : 1.0;
  }
}
