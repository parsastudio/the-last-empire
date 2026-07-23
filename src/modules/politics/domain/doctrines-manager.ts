import type { DoctrinesState } from "../schemas/doctrines.schema";

export interface Doctrine {
  id: string;
  name: string;
  branch: "INDUSTRIAL_TECH" | "ASYMMETRIC_MILITARY" | "DIPLOMATIC_HEGEMONY";
  cost: number;
}

export class DoctrinesManager {
  private readonly doctrines: Doctrine[] = [
    {
      id: "gdp-booster",
      name: "Automation Pipelines",
      branch: "INDUSTRIAL_TECH",
      cost: 3,
    },
    {
      id: "low-upkeep",
      name: "Green Logistics Grid",
      branch: "INDUSTRIAL_TECH",
      cost: 5,
    },
    {
      id: "border-fortification",
      name: "Garrison Protocols",
      branch: "ASYMMETRIC_MILITARY",
      cost: 3,
    },
    {
      id: "drone-swarm",
      name: "Networked Munitions",
      branch: "ASYMMETRIC_MILITARY",
      cost: 5,
    },
    {
      id: "global-influence",
      name: "Cultural Radiance",
      branch: "DIPLOMATIC_HEGEMONY",
      cost: 3,
    },
    {
      id: "reputation-recovery",
      name: "Media Hegemony",
      branch: "DIPLOMATIC_HEGEMONY",
      cost: 5,
    },
  ];

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
    if (state.unlockedDoctrines.includes(doctrineId)) {
      throw new Error("ALREADY_UNLOCKED");
    }
    if (state.doctrinePoints < doctrine.cost) {
      throw new Error("INSUFFICIENT_DOCTRINE_POINTS");
    }

    return {
      doctrinePoints: state.doctrinePoints - doctrine.cost,
      unlockedDoctrines: [...state.unlockedDoctrines, doctrineId],
    };
  }

  public getGdpGrowthModifier(unlocked: string[]): number {
    return unlocked.includes("gdp-booster") ? 0.05 : 0;
  }

  public getUpkeepMultiplier(unlocked: string[]): number {
    return unlocked.includes("low-upkeep") ? 0.9 : 1.0;
  }

  public getHomelandDefenseBonus(unlocked: string[]): number {
    return unlocked.includes("border-fortification") ? 0.25 : 0;
  }

  public getDroneMultiplier(unlocked: string[]): number {
    return unlocked.includes("drone-swarm") ? 1.35 : 1.0;
  }

  public getReputationGainMultiplier(unlocked: string[]): number {
    return unlocked.includes("reputation-recovery") ? 1.5 : 1.0;
  }
}
